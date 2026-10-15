const test = require('node:test');
const assert = require('node:assert/strict');
const planning = require('../resource-planning');
const handler = require('../api/resource-planning');
const store = require('../api/planning-store');

const boardId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const cardId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const memberId = 'cccccccccccccccccccccccc';
const adminId = 'dddddddddddddddddddddddd';

test('full weekdays are inclusive and independent of time zones and holidays', () => {
  assert.equal(planning.weekdays('2026-10-16', '2026-10-20'), 3);
  assert.equal(planning.weekdays('2026-10-17', '2026-10-18'), 0);
  assert.equal(planning.weekdays('2026-12-25', '2026-12-25'), 1);
  assert.equal(planning.weekdays('2026-10-20', '2026-10-16'), 0);
  assert.equal(planning.date('2026-02-30'), null);
  assert.equal(planning.weekdays('2026-01-01', '2026-12-31'), 261);
});

test('week and month bounds and exact selected-day conflicts', () => {
  assert.deepEqual(planning.bounds('2026-10-18', 'week'),
    { start: '2026-10-12', end: '2026-10-18' });
  assert.deepEqual(planning.bounds('2028-02-14', 'month'),
    { start: '2028-02-01', end: '2028-02-29' });
  const entries = [
    { id: 'a', memberId, dates: ['2026-10-16', '2026-10-19'] },
    { id: 'b', memberId, dates: ['2026-10-19', '2026-10-20'] },
    { id: 'c', memberId, dates: ['2026-10-16'] },
    { id: 'd', memberId: 'other', dates: ['2026-10-16', '2026-10-19'] }
  ];
  assert.deepEqual(planning.conflicts(entries), { a: 2, b: 1, c: 1 });
  assert.deepEqual(planning.normalizeDates(['2026-10-20', '2026-10-16']), ['2026-10-16', '2026-10-20']);
  assert.equal(planning.normalizeDates(['2026-10-17']), null);
  assert.equal(planning.normalizeDates(['2026-10-19', '2026-10-19']), null);
});

test('API blocks non-admin reads and writes, then supports CRUD for an admin', async () => {
  const originalFetch = global.fetch;
  const originalRead = store.read, originalUpdate = store.update;
  const originalEnv = {
    TRELLO_API_KEY: process.env.TRELLO_API_KEY,
    BLOB_STORE_ID: process.env.BLOB_STORE_ID
  };
  process.env.TRELLO_API_KEY = 'test-key';
  process.env.BLOB_STORE_ID = 'test-store';
  let role = 'normal', storeCalls = 0, cardBoard = boardId, cardClosed = false;
  let rows = [];
  store.read = async () => { storeCalls++; return { assignments: rows.slice() }; };
  store.update = async (_, change) => {
    storeCalls++;
    const next = change(rows.slice());
    rows = next.assignments;
    return next.result;
  };
  global.fetch = async (url, options) => {
    const path = String(url);
    let result;
    if (path.includes('/members/me')) result = { id: adminId };
    else if (path.includes('/memberships')) result = [{ idMember: adminId, memberType: role }];
    else if (path.includes('/boards/' + boardId + '/members')) result = [{ id: memberId, fullName: 'Casey' }];
    else if (path.includes('/boards/' + boardId + '/cards/all')) result = [{
      id: cardId, name: 'A card', shortUrl: 'https://trello.com/c/abc123', closed: cardClosed
    }];
    else if (path.includes('/cards/' + cardId)) result = {
      idBoard: cardBoard, name: 'A card', shortUrl: 'https://trello.com/c/abc123', closed: cardClosed
    };
    else throw new Error('Unexpected URL ' + path);
    return { ok: true, json: async () => result };
  };
  async function request(method, body) {
    let status, data;
    await handler({ method, query: { boardId }, headers: { authorization: 'Bearer test-token-12345678901234567890' }, body }, {
      setHeader() {}, status(code) { status = code; return this; }, json(value) { data = value; }
    });
    return { status, data };
  }
  try {
    assert.equal((await request('GET')).status, 403);
    assert.equal((await request('POST', { cardId, memberId, dates: ['2026-10-19'] })).status, 403);
    assert.equal(storeCalls, 0);
    role = 'admin';
    assert.equal((await request('POST', { cardId, memberId, dates: ['2026-10-17'] })).status, 400);
    assert.equal((await request('POST', { cardId, memberId: adminId, dates: ['2026-10-19'] })).status, 400);
    cardBoard = 'eeeeeeeeeeeeeeeeeeeeeeee';
    assert.equal((await request('POST', { cardId, memberId, dates: ['2026-10-19'] })).status, 400);
    cardBoard = boardId;
    const created = await request('POST', { cardId, memberId, dates: ['2026-10-20', '2026-10-19', '2026-10-23'] });
    assert.equal(created.status, 201);
    assert.deepEqual(created.data.assignment.dates, ['2026-10-19', '2026-10-20', '2026-10-23']);
    assert.equal((await request('POST', { cardId, memberId, dates: ['2026-10-26'] })).status, 409);
    assert.equal((await request('GET')).data.assignments.length, 1);
    cardClosed = true;
    assert.equal((await request('GET')).data.assignments[0].archived, true);
    cardClosed = false;
    const id = created.data.assignment.id;
    assert.equal((await request('PUT', { id, memberId, dates: ['2026-10-20', '2026-10-26'] })).status, 200);
    assert.deepEqual((await request('GET')).data.assignments[0].dates, ['2026-10-20', '2026-10-26']);
    role = 'normal';
    assert.equal((await request('GET')).status, 403);
    assert.equal((await request('DELETE', { id })).status, 403);
    assert.equal(rows.length, 1);
    role = 'admin';
    assert.equal((await request('DELETE', { id })).status, 200);
    assert.equal((await request('GET')).data.assignments.length, 0);
  } finally {
    global.fetch = originalFetch;
    store.read = originalRead;
    store.update = originalUpdate;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('private Blob store retries a concurrent board update without losing assignments', async () => {
  class BlobPreconditionFailedError extends Error {}
  let document = null, etag = 0, conflictOnce = true;
  const fakeBlob = {
    BlobPreconditionFailedError,
    async get(path, options) {
      assert.match(path, /^kanbrain\/planning\/v1\/preview\//);
      assert.equal(options.access, 'private');
      assert.equal(options.useCache, false);
      return document && { stream: new Response(JSON.stringify(document)).body, blob: { etag: String(etag) } };
    },
    async put(path, value, options) {
      assert.equal(options.access, 'private');
      if (document && !options.allowOverwrite) throw new Error('Blob already exists');
      if (options.ifMatch && options.ifMatch !== String(etag)) throw new BlobPreconditionFailedError();
      if (conflictOnce && document) {
        conflictOnce = false;
        document = { version: 1, assignments: [...document.assignments, { id: 'other' }] };
        etag++;
        throw new BlobPreconditionFailedError();
      }
      document = JSON.parse(value);
      etag++;
    }
  };
  const blobStore = store.createStore(fakeBlob);
  await blobStore.update(boardId, assignments => ({ assignments: [...assignments, { id: 'first' }] }));
  await blobStore.update(boardId, assignments => ({ assignments: [...assignments, { id: 'second' }] }));
  assert.deepEqual((await blobStore.read(boardId)).assignments.map(a => a.id), ['first', 'other', 'second']);
});
