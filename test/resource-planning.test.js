const test = require('node:test');
const assert = require('node:assert/strict');
const planning = require('../resource-planning');
const handler = require('../api/resource-planning');

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

test('week and month bounds and weekday-only conflict detection', () => {
  assert.deepEqual(planning.bounds('2026-10-18', 'week'),
    { start: '2026-10-12', end: '2026-10-18' });
  assert.deepEqual(planning.bounds('2028-02-14', 'month'),
    { start: '2028-02-01', end: '2028-02-29' });
  const entries = [
    { id: 'a', memberId, startDate: '2026-10-16', endDate: '2026-10-18' },
    { id: 'b', memberId, startDate: '2026-10-17', endDate: '2026-10-19' },
    { id: 'c', memberId, startDate: '2026-10-16', endDate: '2026-10-19' },
    { id: 'd', memberId: 'other', startDate: '2026-10-16', endDate: '2026-10-19' }
  ];
  assert.deepEqual(planning.conflicts(entries), { a: 1, b: 1, c: 2 });
});

test('API blocks non-admin reads and writes, then supports CRUD for an admin', async () => {
  const originalFetch = global.fetch;
  const originalEnv = {
    TRELLO_API_KEY: process.env.TRELLO_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN
  };
  process.env.TRELLO_API_KEY = 'test-key';
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-secret';
  let role = 'normal', redisCalls = 0, cardBoard = boardId;
  const rows = new Map();
  global.fetch = async (url, options) => {
    const path = String(url);
    let result;
    if (path.startsWith('https://redis.example.test')) {
      redisCalls++;
      const [command, , field, value] = JSON.parse(options.body);
      if (command === 'HGETALL') result = [...rows].flatMap(([id, data]) => [id, data]);
      if (command === 'HGET') result = rows.get(field) || null;
      if (command === 'HSET') { rows.set(field, value); result = 1; }
      if (command === 'HDEL') { rows.delete(field); result = 1; }
    } else if (path.includes('/members/me')) result = { id: adminId };
    else if (path.includes('/memberships')) result = [{ idMember: adminId, memberType: role }];
    else if (path.includes('/boards/' + boardId + '/members')) result = [{ id: memberId, fullName: 'Casey' }];
    else if (path.includes('/cards/' + cardId)) result = {
      idBoard: cardBoard, name: 'A card', shortUrl: 'https://trello.com/c/abc123', closed: false
    };
    else throw new Error('Unexpected URL ' + path);
    return { ok: true, json: async () => path.startsWith('https://redis.example.test') ? { result } : result };
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
    assert.equal((await request('POST', { cardId, memberId, startDate: '2026-10-19', endDate: '2026-10-20' })).status, 403);
    assert.equal(redisCalls, 0);
    role = 'admin';
    assert.equal((await request('POST', { cardId, memberId, startDate: '2026-10-17', endDate: '2026-10-18' })).status, 400);
    assert.equal((await request('POST', { cardId, memberId: adminId, startDate: '2026-10-19', endDate: '2026-10-20' })).status, 400);
    cardBoard = 'eeeeeeeeeeeeeeeeeeeeeeee';
    assert.equal((await request('POST', { cardId, memberId, startDate: '2026-10-19', endDate: '2026-10-20' })).status, 400);
    cardBoard = boardId;
    const created = await request('POST', { cardId, memberId, startDate: '2026-10-19', endDate: '2026-10-20' });
    assert.equal(created.status, 201);
    assert.equal((await request('GET')).data.assignments.length, 1);
    const id = created.data.assignment.id;
    assert.equal((await request('PUT', { id, memberId, startDate: '2026-10-20', endDate: '2026-10-21' })).status, 200);
    assert.equal((await request('GET')).data.assignments[0].startDate, '2026-10-20');
    role = 'normal';
    assert.equal((await request('GET')).status, 403);
    assert.equal((await request('DELETE', { id })).status, 403);
    assert.equal(rows.size, 1);
    role = 'admin';
    assert.equal((await request('DELETE', { id })).status, 200);
    assert.equal((await request('GET')).data.assignments.length, 0);
  } finally {
    global.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
