const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const planning = require('../resource-planning');

test('card planner retries after Trello sign-in and explains denied access', async () => {
  function element() {
    return {
      value: '', hidden: false, children: [], listeners: {},
      addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
      appendChild(child) { this.children.push(child); },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      setAttribute() {}, focus() {}, reset() {}
    };
  }
  const ids = ['kb-resource', 'kb-plan-form', 'kb-plan-member', 'kb-plan-list',
    'kb-plan-status', 'kb-plan-submit', 'kb-plan-cancel', 'kb-calendar-grid',
    'kb-selected-days', 'kb-calendar-month', 'kb-calendar-prev', 'kb-calendar-next'];
  const nodes = Object.fromEntries(ids.map(id => [id, element()]));
  nodes['kb-resource'].hidden = true;
  let token = null, denied = false, calls = [];
  const t = {
    board: async () => ({ id: 'a'.repeat(24) }),
    card: async () => ({ id: 'b'.repeat(24) }),
    getRestApi: () => ({ getToken: async () => token }),
    sizeTo() {}
  };
  const context = vm.createContext({
    document: { getElementById: id => nodes[id], createElement: element },
    KBPlanning: planning,
    fetch: async (_, options) => {
      calls.push(options.headers.Authorization);
      return { ok: !denied, status: denied ? 403 : 200,
        json: async () => denied ? { error: 'Board admin access required' } :
          { assignments: [{ id: 'b'.repeat(24) + ':' + 'c'.repeat(24), cardId: 'b'.repeat(24),
              memberId: 'c'.repeat(24), dates: ['2026-10-19'] }],
            members: [{ id: 'c'.repeat(24), name: 'Casey' }] } };
    },
    Date, Set, Promise, encodeURIComponent
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../resource-planning-ui.js'), 'utf8'), context);
  async function settle() { await new Promise(resolve => setImmediate(resolve)); }

  context.kbResourceCard(t);
  await settle();
  assert.equal(calls.length, 0);
  assert.equal(nodes['kb-resource'].hidden, true);

  token = 'first-token';
  context.kbResourceCard(t);
  await settle();
  assert.deepEqual(calls, ['Bearer first-token']);
  assert.equal(nodes['kb-resource'].hidden, false);
  assert.equal(nodes['kb-plan-member'].listeners.change.length, 1);
  context.kbResourceCard(t);
  context.kbResourceCard(t);
  await settle();
  assert.equal(calls.length, 1, 'repeated renders reuse the recent successful load');
  nodes['kb-plan-member'].value = 'c'.repeat(24);
  nodes['kb-plan-member'].listeners.change[0]();
  nodes['kb-plan-form'].listeners.submit[0]({ preventDefault() {} });
  await settle();
  assert.equal(calls.length, 2, 'save uses the committed response without a follow-up GET');
  assert.equal(nodes['kb-plan-status'].textContent, 'Selected days saved.');

  token = 'renewed-token';
  denied = true;
  context.kbResourceCard(t);
  await settle();
  assert.deepEqual(calls, ['Bearer first-token', 'Bearer first-token', 'Bearer renewed-token']);
  assert.equal(nodes['kb-plan-member'].listeners.change.length, 1);
  assert.equal(nodes['kb-resource'].hidden, false);
  assert.equal(nodes['kb-plan-form'].hidden, true);
  assert.match(nodes['kb-plan-status'].textContent, /Only board admins/);
});

test('planning client coalesces in-flight GETs but never caches responses or crosses credentials', async () => {
  const pending = [];
  const context = vm.createContext({
    fetch: (url, options) => new Promise(resolve => pending.push({ url, options, resolve })),
    Date, Set, Promise, Map, encodeURIComponent
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../resource-planning-ui.js'), 'utf8'), context);
  const request = context.kbPlanningRequest;
  const first = request('one', 'board', 'GET', null, 'card');
  assert.equal(request('one', 'board', 'GET', null, 'card'), first);
  const otherToken = request('two', 'board', 'GET', null, 'card');
  const settings = request('one', 'board', 'GET', null, null, 'members');
  assert.equal(pending.length, 3);
  assert.match(pending[2].url, /view=members/);
  pending.forEach(p => p.resolve({ ok: true, json: async () => ({ members: [], assignments: [] }) }));
  await Promise.all([first, otherToken, settings]);
  const retry = request('one', 'board', 'GET', null, 'card');
  assert.equal(pending.length, 4, 'completed GET responses are not cached');
  pending[3].resolve({ ok: false, status: 503, json: async () => ({ error: 'Unavailable' }) });
  await assert.rejects(retry, /Unavailable/);
  const recovered = request('one', 'board', 'GET', null, 'card');
  assert.equal(pending.length, 5, 'failed requests can be retried');
  pending[4].resolve({ ok: true, json: async () => ({ assignments: [] }) });
  await recovered;
});
