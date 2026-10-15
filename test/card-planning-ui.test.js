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
          { assignments: [], members: [{ id: 'c'.repeat(24), name: 'Casey' }] } };
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

  token = 'renewed-token';
  denied = true;
  context.kbResourceCard(t);
  await settle();
  assert.deepEqual(calls, ['Bearer first-token', 'Bearer renewed-token']);
  assert.equal(nodes['kb-plan-member'].listeners.change.length, 1);
  assert.equal(nodes['kb-resource'].hidden, false);
  assert.equal(nodes['kb-plan-form'].hidden, true);
  assert.match(nodes['kb-plan-status'].textContent, /Only board admins/);
});
