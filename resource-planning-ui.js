/* Shared, same-origin client for the admin-gated planning API. */
function kbPlanningRequest(token, boardId, method, body, cardId) {
  var query = '?boardId=' + encodeURIComponent(boardId) +
    (cardId ? '&cardId=' + encodeURIComponent(cardId) : '');
  return fetch('/api/resource-planning' + query, {
    method: method,
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  }).then(function(response) {
    return response.json().then(function(data) {
      if (!response.ok) { var e = new Error(data.error || 'Planning request failed'); e.status = response.status; throw e; }
      return data;
    });
  });
}
function kbPlanningToday() {
  var d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')].join('-');
}

function kbResourceCard(t) {
  var panel = document.getElementById('kb-resource');
  if (!panel) return;
  Promise.all([t.board('id'), t.card('id'), t.getRestApi().getToken()]).then(function(context) {
    var boardId = context[0].id, cardId = context[1].id, token = context[2];
    if (!token) return;
    var assignments = [], members = [], editing = null;
    var form = document.getElementById('kb-plan-form');
    var member = document.getElementById('kb-plan-member');
    var start = document.getElementById('kb-plan-start');
    var end = document.getElementById('kb-plan-end');
    var list = document.getElementById('kb-plan-list');
    var status = document.getElementById('kb-plan-status');
    var submit = document.getElementById('kb-plan-submit');
    var cancel = document.getElementById('kb-plan-cancel');

    function resize() { t.sizeTo('#kb-wrap'); }
    function reset() { editing = null; form.reset(); submit.textContent = 'Add assignment'; cancel.hidden = true; }
    function showError(e) {
      if (e.status === 403 || e.status === 401) { panel.hidden = true; return; }
      panel.hidden = false;
      status.textContent = e.message;
      status.className = 'kb-plan-status error';
      resize();
    }
    function load() {
      return kbPlanningRequest(token, boardId, 'GET', null, cardId).then(function(data) {
        assignments = data.assignments;
        members = data.members;
        member.replaceChildren();
        var placeholder = document.createElement('option');
        placeholder.value = ''; placeholder.textContent = 'Select board member';
        member.appendChild(placeholder);
        members.forEach(function(m) {
          var option = document.createElement('option');
          option.value = m.id; option.textContent = m.name;
          member.appendChild(option);
        });
        render(); panel.hidden = false; resize();
      }).catch(showError);
    }
    function render() {
      list.replaceChildren();
      if (!assignments.length) {
        var empty = document.createElement('p');
        empty.className = 'kb-plan-empty';
        empty.textContent = 'No planned work for this card yet.';
        list.appendChild(empty);
      }
      assignments.forEach(function(a) {
        var row = document.createElement('div'); row.className = 'kb-plan-row';
        var info = document.createElement('div'); info.className = 'kb-plan-info';
        var name = document.createElement('strong');
        name.textContent = (members.find(function(m) { return m.id === a.memberId; }) || {}).name || 'Former member';
        var dates = document.createElement('span');
        dates.textContent = a.startDate + ' → ' + a.endDate + ' · ' +
          KBPlanning.weekdays(a.startDate, a.endDate) + ' working days';
        info.append(name, dates);
        var actions = document.createElement('div'); actions.className = 'kb-plan-actions';
        var edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Edit';
        edit.addEventListener('click', function() {
          editing = a.id; member.value = a.memberId; start.value = a.startDate; end.value = a.endDate;
          submit.textContent = 'Save changes'; cancel.hidden = false; status.textContent = '';
          member.focus(); resize();
        });
        var remove = document.createElement('button'); remove.type = 'button';
        remove.className = 'danger'; remove.textContent = 'Delete';
        remove.addEventListener('click', function() {
          remove.disabled = true;
          kbPlanningRequest(token, boardId, 'DELETE', { id: a.id }).then(function() {
            status.textContent = 'Assignment deleted.'; reset(); return load();
          }).catch(showError).finally(function() { remove.disabled = false; });
        });
        actions.append(edit, remove); row.append(info, actions); list.appendChild(row);
      });
    }
    cancel.addEventListener('click', reset);
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      status.textContent = '';
      if (!KBPlanning.weekdays(start.value, end.value)) {
        return showError(new Error('Choose dates containing at least one weekday.'));
      }
      submit.disabled = true;
      var body = { memberId: member.value, startDate: start.value, endDate: end.value, cardId: cardId };
      if (editing) body.id = editing;
      kbPlanningRequest(token, boardId, editing ? 'PUT' : 'POST', body).then(function() {
        status.textContent = 'Assignment saved.';
        status.className = 'kb-plan-status';
        reset(); return load();
      }).catch(showError).finally(function() { submit.disabled = false; });
    });
    load();
  }).catch(function() { /* No token/context: no planning data is exposed. */ });
}
