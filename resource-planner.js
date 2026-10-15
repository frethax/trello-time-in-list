(function() {
  var t = TrelloPowerUp.iframe({ appKey: '526d48a7eb9050082ce280fe0ac1a67f', appName: 'Kanbrain' });
  var anchor = kbPlanningToday(), view = 'week', members = [], assignments = [];
  var visibleMemberIds = null, saveFilterChain = Promise.resolve();
  var boardId, token;
  var timeline = document.getElementById('timeline');
  var status = document.getElementById('planner-status');
  var filter = document.getElementById('member-filter');
  var search = document.getElementById('resource-search');

  function saveVisibility() {
    var value = KBPlanning.visibleMembersValue(visibleMemberIds);
    saveFilterChain = saveFilterChain.catch(function() {}).then(function() {
      return t.set('member', 'private', KBPlanning.visibilityKey(boardId), value);
    });
    saveFilterChain.catch(function() {
      status.textContent = 'Could not save the resource filter. Please try again.';
      status.className = 'error';
    });
  }
  function renderFilter() {
    filter.replaceChildren();
    var query = search.value.trim().toLocaleLowerCase();
    var matches = 0;
    members.forEach(function(m) {
      var label = document.createElement('label');
      label.hidden = !m.name.toLocaleLowerCase().includes(query);
      if (!label.hidden) matches++;
      var checkbox = document.createElement('input'); checkbox.type = 'checkbox';
      checkbox.checked = visibleMemberIds === null || visibleMemberIds.has(m.id);
      checkbox.addEventListener('change', function() {
        if (visibleMemberIds === null) visibleMemberIds = new Set(members.map(function(x) { return x.id; }));
        if (checkbox.checked) visibleMemberIds.add(m.id); else visibleMemberIds.delete(m.id);
        if (visibleMemberIds.size === members.length) visibleMemberIds = null;
        renderFilter(); render(); saveVisibility();
      });
      var name = document.createElement('span'); name.textContent = m.name;
      label.append(checkbox, name); filter.appendChild(label);
    });
    var count = visibleMemberIds === null ? members.length :
      members.filter(function(m) { return visibleMemberIds.has(m.id); }).length;
    document.getElementById('resource-filter-label').textContent =
      visibleMemberIds === null ? 'All resources' :
        count === 0 ? 'No resources selected' : count + ' of ' + members.length + ' selected';
    document.getElementById('resource-no-results').hidden = matches !== 0 || !query;
  }

  function dateLabel(value) {
    return new Date(value + 'T00:00:00Z').toLocaleDateString(undefined,
      { timeZone: 'UTC', day: 'numeric', month: 'short' });
  }
  function daysInRange(start, end) {
    var days = [];
    for (var current = start; current <= end; current = KBPlanning.add(current, 1)) days.push(current);
    return days;
  }
  function shift(amount) {
    if (view === 'week') anchor = KBPlanning.add(anchor, amount * 7);
    else {
      var d = KBPlanning.date(anchor);
      anchor = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + amount, 1))
        .toISOString().slice(0, 10);
    }
    render();
  }
  function refresh() {
    status.textContent = 'Loading…'; status.className = '';
    return kbPlanningRequest(token, boardId, 'GET').then(function(data) {
      assignments = data.assignments; members = data.members;
      renderFilter();
      render();
    }).catch(function(e) {
      timeline.replaceChildren(); status.textContent = e.message; status.className = 'error';
    });
  }
  function render() {
    var bounds = KBPlanning.bounds(anchor, view);
    var days = daysInRange(bounds.start, bounds.end);
    var width = days.length * 44;
    var shownMembers = members.filter(function(m) {
      return visibleMemberIds === null || visibleMemberIds.has(m.id);
    });
    var shownIds = new Set(shownMembers.map(function(m) { return m.id; }));
    var visibleAssignments = assignments.filter(function(a) {
      return shownIds.has(a.memberId) &&
        (document.getElementById('show-archived').checked || !a.archived) &&
        a.dates.some(function(day) { return day >= bounds.start && day <= bounds.end; });
    });
    var conflicts = KBPlanning.conflicts(visibleAssignments.map(function(a) {
      return { id: a.id, memberId: a.memberId,
        dates: a.dates.filter(function(day) { return day >= bounds.start && day <= bounds.end; }) };
    }));
    var heading = view === 'month' ? new Date(bounds.start + 'T00:00:00Z').toLocaleDateString(undefined,
      { timeZone: 'UTC', month: 'long', year: 'numeric' }) : dateLabel(bounds.start) + ' – ' + dateLabel(bounds.end);
    document.getElementById('period-label').textContent = heading;
    document.getElementById('week').setAttribute('aria-pressed', view === 'week');
    document.getElementById('month').setAttribute('aria-pressed', view === 'month');
    timeline.replaceChildren();
    var head = document.createElement('div'); head.className = 'timeline-head';
    var memberHead = document.createElement('div'); memberHead.className = 'member-head'; memberHead.textContent = 'Member';
    var dayHeads = document.createElement('div'); dayHeads.className = 'day-heads';
    dayHeads.style.gridTemplateColumns = 'repeat(' + days.length + ', 44px)'; dayHeads.style.width = width + 'px';
    days.forEach(function(day) {
      var d = KBPlanning.date(day), cell = document.createElement('div');
      cell.className = 'day-head' + (d.getUTCDay() % 6 === 0 ? ' weekend' : '');
      cell.textContent = view === 'week' ? d.toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', day: 'numeric' }) : String(d.getUTCDate());
      dayHeads.appendChild(cell);
    });
    head.append(memberHead, dayHeads); timeline.appendChild(head);

    shownMembers.forEach(function(m) {
      var row = document.createElement('div'); row.className = 'timeline-row';
      var name = document.createElement('div'); name.className = 'member-name'; name.textContent = m.name;
      var grid = document.createElement('div'); grid.className = 'days-grid';
      grid.style.gridTemplateColumns = 'repeat(' + days.length + ', 44px)'; grid.style.width = width + 'px';
      var allocations = visibleAssignments.filter(function(a) { return a.memberId === m.id; })
        .sort(function(a, b) { return a.dates[0].localeCompare(b.dates[0]); });
      var lanes = [];
      allocations.forEach(function(a) {
        var activeDays = a.dates.filter(function(day) { return day >= bounds.start && day <= bounds.end; });
        var lane = lanes.findIndex(function(occupied) {
          return !activeDays.some(function(day) { return occupied.has(day); });
        });
        if (lane < 0) lane = lanes.length;
        if (!lanes[lane]) lanes[lane] = new Set();
        activeDays.forEach(function(day) { lanes[lane].add(day); });
        a._lane = lane;
      });
      grid.style.gridTemplateRows = 'repeat(' + Math.max(1, lanes.length) + ', 34px)';
      days.forEach(function(day, index) {
        var shade = document.createElement('div');
        shade.className = 'day-shade' + (KBPlanning.date(day).getUTCDay() % 6 === 0 ? ' weekend' : '');
        shade.style.gridColumn = String(index + 1); shade.style.gridRow = '1 / ' + (Math.max(1, lanes.length) + 1);
        grid.appendChild(shade);
      });
      allocations.forEach(function(a) {
        // Only selected days are painted. Gaps and weekends remain empty.
        var segments = [], segment = null;
        days.forEach(function(day) {
          if (a.dates.indexOf(day) !== -1) {
            if (!segment) segment = { start: day, end: day };
            else segment.end = day;
          } else if (segment) { segments.push(segment); segment = null; }
        });
        if (segment) segments.push(segment);
        segments.forEach(function(part) {
          var link = document.createElement('a');
          link.className = 'assignment' + (conflicts[a.id] ? ' conflict' : '');
          link.href = /^https:\/\/trello\.com\/c\/[A-Za-z0-9]+/.test(a.cardUrl) ? a.cardUrl : '#';
          link.target = '_blank'; link.rel = 'noopener noreferrer';
          link.style.gridColumn = (days.indexOf(part.start) + 1) + ' / ' + (days.indexOf(part.end) + 2);
          link.style.gridRow = String(a._lane + 1);
          link.textContent = (conflicts[a.id] ? '⚠ ' : '') + a.cardName + (a.archived ? ' (archived)' : '');
          link.title = a.cardName + ' · ' + a.dates.length + ' selected workdays: ' + a.dates.join(', ') +
            (conflicts[a.id] ? ' · overlaps ' + conflicts[a.id] + ' other assignment(s)' : '');
          grid.appendChild(link);
        });
      });
      row.append(name, grid); timeline.appendChild(row);
    });
    if (!shownMembers.length) status.textContent = members.length ?
      'No resources selected. Use Filter resources above to show members.' : 'No board members found.';
    else if (!visibleAssignments.length) status.textContent = 'No assignments in this period.';
    else {
      var count = visibleAssignments.filter(function(a) { return !!conflicts[a.id]; }).length;
      status.textContent = visibleAssignments.length + ' assignment(s) in this period' +
        (count ? ' · ' + count + ' with overlapping workdays' : '');
    }
  }
  document.getElementById('prev').addEventListener('click', function() { shift(-1); });
  document.getElementById('next').addEventListener('click', function() { shift(1); });
  document.getElementById('week').addEventListener('click', function() { view = 'week'; render(); });
  document.getElementById('month').addEventListener('click', function() { view = 'month'; render(); });
  document.getElementById('refresh').addEventListener('click', refresh);
  document.getElementById('show-archived').addEventListener('change', render);
  search.addEventListener('input', renderFilter);
  document.getElementById('resource-select-all').addEventListener('click', function() {
    visibleMemberIds = null; renderFilter(); render(); saveVisibility();
  });
  document.getElementById('resource-select-none').addEventListener('click', function() {
    visibleMemberIds = new Set(); renderFilter(); render(); saveVisibility();
  });
  Promise.all([t.board('id'), t.getRestApi().getToken()]).then(function(values) {
    boardId = values[0].id; token = values[1];
    if (!token) throw new Error('Connect your Trello account in Kanbrain to view the planner.');
    return t.get('member', 'private', KBPlanning.visibilityKey(boardId))
      .then(function(saved) {
        var ids = KBPlanning.normalizeVisibleMembers(saved);
        visibleMemberIds = ids === null ? null : new Set(ids);
      }, function() {})
      .then(refresh);
  }).catch(function(e) { status.textContent = e.message; status.className = 'error'; });
})();
