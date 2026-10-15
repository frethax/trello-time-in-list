const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const planning = require('../resource-planning');

test('planner restores a private resource subset and filters timeline rows', async () => {
  function element() {
    return {
      children: [], listeners: {}, style: {}, checked: false,
      addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
      appendChild(child) { this.children.push(child); },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      setAttribute() {}
    };
  }
  const names = ['timeline', 'planner-status', 'member-filter', 'resource-filter-label',
    'show-archived', 'period-label', 'week', 'month', 'prev', 'next', 'refresh',
    'resource-select-all', 'resource-select-none'];
  const nodes = Object.fromEntries(names.map(name => [name, element()]));
  const members = ['a', 'b', 'c'].map((letter, index) =>
    ({ id: letter.repeat(24), name: 'Member ' + index }));
  const boardId = 'd'.repeat(24), writes = [];
  const t = {
    board: async () => ({ id: boardId }),
    getRestApi: () => ({ getToken: async () => 'test-token' }),
    get: async (_, scope, key) => {
      assert.equal(scope, 'private');
      assert.equal(key, planning.visibilityKey(boardId));
      return planning.visibleMembersValue(new Set([members[1].id]));
    },
    set: async (_, scope, key, value) => { writes.push({ scope, key, value }); }
  };
  const context = vm.createContext({
    TrelloPowerUp: { iframe: () => t },
    document: { getElementById: name => nodes[name], createElement: element },
    KBPlanning: planning,
    kbPlanningToday: () => '2026-10-15',
    kbPlanningRequest: async () => ({ assignments: [], members }),
    Date, Set, Promise
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../resource-planner.js'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(nodes.timeline.children.length, 2, nodes['planner-status'].textContent); // heading and one selected member
  assert.equal(nodes['resource-filter-label'].textContent, 'Resources: 1 of 3');

  nodes['resource-select-all'].listeners.click[0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(nodes.timeline.children.length, 4);
  assert.equal(writes.at(-1).value.ids, null);

  nodes['resource-select-none'].listeners.click[0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(nodes.timeline.children.length, 1);
  assert.equal(nodes['planner-status'].textContent,
    'No resources selected. Use the Resources filter to show members.');
  assert.deepEqual(Array.from(writes.at(-1).value.ids), []);
});
