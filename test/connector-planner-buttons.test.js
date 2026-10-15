const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('Power-Up presents one Resource Planner and keeps task buttons', async () => {
  let capabilities;
  const context = {
    TrelloPowerUp: { initialize(value) { capabilities = value; } },
    kbNormalizeSubtasks: value => ({ enabled: !!value?.enabled }),
    kbOpenParentPicker() {}, kbOpenChildPicker() {},
    Promise
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../connector.js'), 'utf8'), context);

  const boardButtons = capabilities['board-buttons']();
  assert.deepEqual(Array.from(boardButtons, button => button.text), ['Kanbrain', 'Resource Planner']);
  assert.equal(boardButtons.find(button => button.text === 'Resource Planner').condition, 'admin');

  const cardButtons = await capabilities['card-buttons']({ get: async () => ({ enabled: true }) });
  assert.deepEqual(Array.from(cardButtons, button => button.text), ['Main Task', 'Add Subtask']);
  assert.deepEqual(Array.from(await capabilities['card-buttons']({ get: async () => null })), []);
});
