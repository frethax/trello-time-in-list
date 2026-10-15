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
  // Trello can finish authorization after this iframe first renders. A later
  // render must retry the request without attaching the form handlers twice.
  if (panel._kbResourceLoad) return panel._kbResourceLoad();
  Promise.all([t.board('id'), t.card('id'), t.getRestApi().getToken()]).then(function(context) {
    var boardId = context[0].id, cardId = context[1].id, token = context[2];
    if (!token) return;
    if (panel._kbResourceLoad) return panel._kbResourceLoad();
    var assignments = [], members = [], selected = new Set();
    var month = kbPlanningToday().slice(0, 7) + '-01';
    var form = document.getElementById('kb-plan-form');
    var member = document.getElementById('kb-plan-member');
    var list = document.getElementById('kb-plan-list');
    var status = document.getElementById('kb-plan-status');
    var submit = document.getElementById('kb-plan-submit');
    var cancel = document.getElementById('kb-plan-cancel');
    var grid = document.getElementById('kb-calendar-grid');
    var selectedLabel = document.getElementById('kb-selected-days');

    function resize() { t.sizeTo('#kb-wrap'); }
    function currentAssignment() {
      return assignments.find(function(a) { return a.memberId === member.value; });
    }
    function reset() {
      form.reset(); selected.clear(); cancel.hidden = true;
      month = kbPlanningToday().slice(0, 7) + '-01';
      renderCalendar();
    }
    function showError(e) {
      panel.hidden = false;
      var denied = e.status === 403 || e.status === 401;
      form.hidden = denied;
      list.hidden = denied;
      status.textContent = e.status === 403 ? 'Only board admins can open Resource Planning on this board.' :
        e.status === 401 ? 'Connect your Trello account again to open Resource Planning.' : e.message;
      status.className = 'kb-plan-status error';
      resize();
    }
    function load() {
      return kbPlanningRequest(token, boardId, 'GET', null, cardId).then(function(data) {
        form.hidden = false;
        list.hidden = false;
        status.textContent = '';
        status.className = 'kb-plan-status';
        assignments = data.assignments;
        members = data.members;
        var previousMember = member.value;
        member.replaceChildren();
        var placeholder = document.createElement('option');
        placeholder.value = ''; placeholder.textContent = 'Select board member';
        member.appendChild(placeholder);
        members.forEach(function(m) {
          var option = document.createElement('option');
          option.value = m.id; option.textContent = m.name;
          member.appendChild(option);
        });
        member.value = previousMember;
        renderList(); renderCalendar(); panel.hidden = false; resize();
      }).catch(showError);
    }
    function renderList() {
      list.replaceChildren();
      if (!assignments.length) {
        var empty = document.createElement('p');
        empty.className = 'kb-plan-empty';
        empty.textContent = 'No planned work for this card yet. Select a member and click the days below.';
        list.appendChild(empty);
      }
      assignments.forEach(function(a) {
        var row = document.createElement('div'); row.className = 'kb-plan-row';
        var info = document.createElement('div'); info.className = 'kb-plan-info';
        var name = document.createElement('strong');
        name.textContent = (members.find(function(m) { return m.id === a.memberId; }) || {}).name || 'Former member';
        var dates = document.createElement('span');
        dates.textContent = a.dates.length + ' working day' + (a.dates.length === 1 ? '' : 's') + ': ' + a.dates.join(', ');
        info.append(name, dates);
        var actions = document.createElement('div'); actions.className = 'kb-plan-actions';
        var edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Edit days';
        edit.addEventListener('click', function() {
          member.value = a.memberId;
          selectMember(); member.focus();
        });
        var remove = document.createElement('button'); remove.type = 'button';
        remove.className = 'danger'; remove.textContent = 'Delete';
        var confirming = false;
        remove.addEventListener('click', function() {
          if (!confirming) {
            confirming = true; remove.textContent = 'Confirm delete';
            status.textContent = 'Click Confirm delete to remove all planned days for ' + name.textContent + '.';
            status.className = 'kb-plan-status error';
            return;
          }
          remove.disabled = true;
          kbPlanningRequest(token, boardId, 'DELETE', { id: a.id }).then(function() {
            status.textContent = 'Plan deleted.'; status.className = 'kb-plan-status';
            reset(); return load();
          }).catch(showError).finally(function() { remove.disabled = false; });
        });
        actions.append(edit, remove); row.append(info, actions); list.appendChild(row);
      });
    }
    function selectMember() {
      var existing = currentAssignment();
      selected = new Set(existing ? existing.dates : []);
      if (existing && existing.dates.length) month = existing.dates[0].slice(0, 7) + '-01';
      cancel.hidden = !member.value;
      status.textContent = '';
      renderCalendar();
      resize();
    }
    function shiftMonth(delta) {
      var d = KBPlanning.date(month);
      month = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 1))
        .toISOString().slice(0, 10);
      renderCalendar();
    }
    function renderCalendar() {
      var first = KBPlanning.date(month);
      document.getElementById('kb-calendar-month').textContent = first.toLocaleDateString(undefined,
        { timeZone: 'UTC', month: 'long', year: 'numeric' });
      grid.replaceChildren();
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(function(day) {
        var heading = document.createElement('span'); heading.className = 'kb-calendar-weekday';
        heading.textContent = day; grid.appendChild(heading);
      });
      var offset = (first.getUTCDay() + 6) % 7;
      for (var blank = 0; blank < offset; blank++) {
        var spacer = document.createElement('span'); spacer.className = 'kb-calendar-blank'; grid.appendChild(spacer);
      }
      var count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
      for (var number = 1; number <= count; number++) {
        (function(dayNumber) {
          var day = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), dayNumber));
          var iso = day.toISOString().slice(0, 10);
          var button = document.createElement('button'); button.type = 'button';
          button.textContent = String(dayNumber);
          button.setAttribute('aria-label', day.toLocaleDateString(undefined,
            { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
          button.setAttribute('aria-pressed', selected.has(iso) ? 'true' : 'false');
          button.disabled = day.getUTCDay() === 0 || day.getUTCDay() === 6 || !member.value;
          button.addEventListener('click', function() {
            if (selected.has(iso)) selected.delete(iso); else selected.add(iso);
            button.setAttribute('aria-pressed', selected.has(iso) ? 'true' : 'false');
            renderSelection();
          });
          grid.appendChild(button);
        })(number);
      }
      submit.textContent = currentAssignment() ? 'Save selected days' : 'Add selected days';
      renderSelection();
    }
    function renderSelection() {
      var days = Array.from(selected).sort();
      selectedLabel.textContent = days.length ? days.length + ' selected: ' +
        days.slice(0, 8).join(', ') + (days.length > 8 ? ' and ' + (days.length - 8) + ' more' : '') :
        'No days selected. Click weekdays to select them; click again to remove.';
      resize();
    }
    member.addEventListener('change', selectMember);
    cancel.addEventListener('click', reset);
    document.getElementById('kb-calendar-prev').addEventListener('click', function() { shiftMonth(-1); });
    document.getElementById('kb-calendar-next').addEventListener('click', function() { shiftMonth(1); });
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      status.textContent = '';
      var dates = KBPlanning.normalizeDates(Array.from(selected));
      if (!member.value || !dates) return showError(new Error('Select a member and at least one weekday.'));
      submit.disabled = true;
      var existing = currentAssignment();
      var body = { memberId: member.value, dates: dates, cardId: cardId };
      if (existing) body.id = existing.id;
      kbPlanningRequest(token, boardId, existing ? 'PUT' : 'POST', body).then(function() {
        status.textContent = 'Selected days saved.'; status.className = 'kb-plan-status';
        reset(); return load();
      }).catch(showError).finally(function() { submit.disabled = false; });
    });
    panel._kbResourceLoad = function() {
      return t.getRestApi().getToken().then(function(currentToken) {
        if (!currentToken) { panel.hidden = true; return; }
        token = currentToken;
        return load();
      });
    };
    load();
  }).catch(function() { /* No Trello context: no planning data is exposed. */ });
}
