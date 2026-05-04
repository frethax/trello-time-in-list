/* ---- section.js — card-section.html entry point ---- */

(function() {

  var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';

  var t = TrelloPowerUp.iframe({
    appKey:  API_KEY,
    appName: 'Time in List'
  });

  t.render(function() {
    var restApi = t.getRestApi();
    return restApi.getToken()
      .then(function(token) {
        if (!token) { return showAuth(); }
        return loadCard(token);
      })
      .catch(function() { return showAuth(); });
  });

  function showAuth() {
    var root = document.getElementById('root');
    root.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.style.cssText = 'padding:16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';

    var msg = document.createElement('div');
    msg.style.cssText = 'font-size:13px;color:#5e6c84;margin-bottom:12px;';
    msg.innerText = 'Connect your Trello account to see card timing data.';

    var btn = document.createElement('button');
    btn.innerText = 'Connect Trello Account';
    btn.style.cssText = 'background:#0052cc;color:white;border:none;padding:8px 16px;border-radius:4px;font-size:13px;font-weight:600;cursor:pointer';

    btn.addEventListener('click', function() {
      var restApi = t.getRestApi();
      restApi.authorize({ scope: 'read', expiration: 'never' })
        .then(function() { t.render(function() {}); });
    });

    wrap.appendChild(msg);
    wrap.appendChild(btn);
    root.appendChild(wrap);
    t.sizeTo('#root');
  }

  function loadCard(token) {
    return Promise.all([
      t.card('id', 'idList'),
      t.get('board', 'shared', 'doneLists'),
      t.lists('id', 'name')
    ]).then(function(results) {
      var card      = results[0];
      var doneLists = results[1] || [];
      var lists     = results[2] || [];
      var currentListObj  = lists.find(function(l) { return l.id === card.idList; });
      var currentListName = currentListObj ? currentListObj.name : '';
      var isDone = doneLists.indexOf(currentListName) > -1;
      return fetch(
        'https://api.trello.com/1/cards/' + card.id +
        '/actions?filter=updateCard:idList,createCard,commentCard,addMemberToCard' +
        '&key=' + API_KEY + '&token=' + token
      )
      .then(function(r) { return r.json(); })
      .then(function(actions) {
        if (!actions || !actions.length) {
          document.getElementById('root').innerHTML =
            '<div style="font-size:12px;color:#5e6c84;padding:16px">No action data found for this card.</div>';
          t.sizeTo('#root');
          return;
        }
        renderPanel(actions, isDone);
      });
    });
  }
      return fetch(
        'https://api.trello.com/1/cards/' + card.id +
        '/actions?filter=updateCard:idList,createCard,commentCard,addMemberToCard' +
        '&key=' + API_KEY + '&token=' + token
      )
      .then(function(r) { return r.json(); })
      .then(function(actions) {
        if (!actions || !actions.length) {
          document.getElementById('root').innerHTML =
            '<div style="font-size:12px;color:#5e6c84;padding:16px">No action data found for this card.</div>';
          t.sizeTo('#root');
          return;
        }
        renderPanel(actions);
      });
    });
  }

  function renderPanel(actions) {
    var ordered = actions.slice().reverse();
    var moveActions  = ordered.filter(function(a){ return a.data && a.data.listAfter; });
    var createAction = ordered.find(function(a){ return a.type === 'createCard'; });

    var lastMove = moveActions.length ? moveActions[moveActions.length-1] : (createAction || ordered[ordered.length-1]);
var currentList = (lastMove.data && lastMove.data.listAfter) 
  ? lastMove.data.listAfter.name 
  : (createAction && createAction.data && createAction.data.list 
    ? createAction.data.list.name 
    : 'Unknown');    var currentStageTime = Date.now() - new Date(lastMove.date);
    var totalTime = Date.now() - new Date(ordered[0].date);

    var createdBy = '';
    if (createAction && createAction.memberCreator) {
      createdBy = createAction.memberCreator.fullName || createAction.memberCreator.username || '';
    }

    var activityCount = {};
    ordered.forEach(function(a) {
      if (a.memberCreator) {
        var name = a.memberCreator.fullName || a.memberCreator.username || '';
        if (name) activityCount[name] = (activityCount[name] || 0) + 1;
      }
    });
    var mostActive = '', mostActiveCount = 0;
    Object.keys(activityCount).forEach(function(name) {
      if (activityCount[name] > mostActiveCount) { mostActive = name; mostActiveCount = activityCount[name]; }
    });

    var timeline = buildTimeline(ordered);
    var totals   = buildTotals(timeline);
    var listKeys = Object.keys(totals);
    var grandTotal = listKeys.reduce(function(s,k){ return s + totals[k]; }, 0);
    var COLORS = ['#0052cc','#2ea043','#f2cc60','#db61a2','#ff7b72'];
    var colorMap = {};
    listKeys.forEach(function(list, i){ colorMap[list] = COLORS[i % COLORS.length]; });

    var root = document.getElementById('root');
    root.innerHTML = '';

    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:2px';

    var left = document.createElement('div');
    left.style.cssText = 'background:#f4f5f7;border:1px solid #dfe1e6;border-radius:8px;padding:14px;';

    function leftRow(icon, label, value, isLast) {
      return [
        '<div style="' + (isLast ? '' : 'margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #dfe1e6;') + '">',
          '<div style="font-size:10px;font-weight:600;color:#5e6c84;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px">' + icon + ' ' + label + '</div>',
          value,
        '</div>'
      ].join('');
    }

    var leftHTML = '';
    leftHTML += leftRow('⏱', 'Current Stage',
      '<div style="font-size:13px;font-weight:600;color:#172b4d;margin-bottom:2px">' + escHtml(currentList) + '</div>' +
      '<div style="font-size:20px;font-weight:700;color:#2ea043;line-height:1.2">' + formatTime(currentStageTime) + '</div>', false);
    leftHTML += leftRow('📊', 'Card Age',
      '<div style="font-size:20px;font-weight:700;color:#0052cc;line-height:1.2">' + formatTime(totalTime) + '</div>', false);
    if (mostActive) {
      leftHTML += leftRow('👤', 'Most Active',
        '<div style="font-size:14px;font-weight:600;color:#172b4d">' + escHtml(mostActive) +
        ' <span style="color:#5e6c84;font-weight:400">(' + mostActiveCount + ')</span></div>', !createdBy);
    }
    if (createdBy) {
      leftHTML += leftRow('⭐', 'Created By',
        '<div style="font-size:14px;font-weight:600;color:#172b4d">' + escHtml(createdBy) + '</div>', true);
    }
    left.innerHTML = leftHTML;

    var right = document.createElement('div');
    right.style.cssText = 'background:#f4f5f7;border:1px solid #dfe1e6;border-radius:8px;padding:14px;';

    if (!timeline.length) {
      right.innerHTML = '<div style="font-size:12px;color:#5e6c84">No list changes yet.</div>';
    } else {
      var rightHTML = '<div style="font-size:10px;font-weight:600;color:#5e6c84;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px">📋 Time Per List</div>';
      listKeys.forEach(function(list) {
        var color = colorMap[list];
        var pct   = grandTotal > 0 ? (totals[list] / grandTotal * 100) : 0;
        rightHTML += '<div style="margin-bottom:9px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">';
        rightHTML += '<span style="font-size:12px;color:#172b4d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:52%;font-weight:500">' + escHtml(list) + '</span>';
        rightHTML += '<div style="display:flex;gap:6px;align-items:center;flex-shrink:0"><span style="font-size:11px;font-weight:700;color:' + color + '">' + Math.round(pct) + '%</span>';
        rightHTML += '<span style="font-size:11px;color:#5e6c84;white-space:nowrap">' + formatTime(totals[list]) + '</span></div></div>';
        rightHTML += '<div style="height:6px;background:#dfe1e6;border-radius:6px;overflow:hidden"><div style="height:100%;background:' + color + ';width:' + pct + '%;border-radius:6px"></div></div></div>';
      });
      right.innerHTML = rightHTML;

      var divider = document.createElement('div');
      divider.style.cssText = 'border-top:1px solid #dfe1e6;margin:10px 0 8px;';
      right.appendChild(divider);

      var histTitle = document.createElement('div');
      histTitle.style.cssText = 'display:flex;justify-content:space-between;align-items:center;cursor:pointer;user-select:none;';
      histTitle.innerHTML = '<span style="font-size:10px;font-weight:600;color:#5e6c84;text-transform:uppercase;letter-spacing:0.6px">≡ Card History</span><span id="tl-arrow" style="font-size:9px;color:#5e6c84;transition:transform 0.2s">▶</span>';
      right.appendChild(histTitle);

      var tlList = document.createElement('div');
      tlList.id = 'tl-list';
      tlList.style.cssText = 'overflow:hidden;max-height:0;transition:max-height 0.25s ease,margin-top 0.25s ease;margin-top:0;';

      timeline.forEach(function(item, idx) {
        var color  = colorMap[item.list] || COLORS[0];
        var isLast = idx === timeline.length - 1;
        var el = document.createElement('div');
        el.style.cssText = 'display:flex;gap:7px;padding-bottom:8px;';
        el.innerHTML = [
          '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:10px">',
            '<div style="width:8px;height:8px;border-radius:50%;background:' + color + ';flex-shrink:0;margin-top:2px"></div>',
            '<div style="width:2px;flex:1;background:' + (isLast?'transparent':'#dfe1e6') + ';margin-top:3px"></div>',
          '</div>',
          '<div style="flex:1;min-width:0">',
            '<div style="font-size:12px;font-weight:600;color:#172b4d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(item.list) + '</div>',
            '<div style="font-size:10px;color:#5e6c84;margin-top:1px">' + (item.date ? formatDate(item.date) + ' · ' : '') + formatTime(item.duration) + '</div>',
          '</div>'
        ].join('');
        tlList.appendChild(el);
      });
      right.appendChild(tlList);

      var open = false;
      histTitle.addEventListener('click', function() {
        open = !open;
        var arrow = document.getElementById('tl-arrow');
        var list  = document.getElementById('tl-list');
        if (open) {
          list.style.maxHeight = list.scrollHeight + 'px';
          list.style.marginTop = '8px';
          if (arrow) arrow.style.transform = 'rotate(90deg)';
        } else {
          list.style.maxHeight = '0';
          list.style.marginTop = '0';
          if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
        setTimeout(function(){ t.sizeTo('#root'); }, 300);
      });
    }

    wrapper.appendChild(left);
    wrapper.appendChild(right);
    root.appendChild(wrapper);
    t.sizeTo('#root');
  }

  function formatTime(ms) {
    var minutes = Math.floor(ms / (1000 * 60));
    var hours   = Math.floor(ms / (1000 * 60 * 60));
    var days    = Math.floor(hours / 24);
    var rest    = hours % 24;
    if (minutes < 60) return minutes + ' minutes';
    if (days > 0 && rest > 0) return days + ' days ' + rest + ' hours';
    if (days > 0) return days + ' days';
    return hours + ' hours';
  }

  function formatDate(d) {
    var dt  = new Date(d);
    var day = String(dt.getDate()).padStart(2,'0');
    var mon = String(dt.getMonth()+1).padStart(2,'0');
    var h   = String(dt.getHours()).padStart(2,'0');
    var min = String(dt.getMinutes()).padStart(2,'0');
    return day + '.' + mon + ' ' + h + ':' + min;
  }

  function buildTimeline(actions) {
    var timeline = [], createAction = null, moveActions = [];
    actions.forEach(function(a) {
      if (a.type === 'createCard') createAction = a;
      else if (a.data && a.data.listAfter) moveActions.push(a);
    });
    if (createAction && moveActions.length) {
      var init = (createAction.data && createAction.data.list)
        ? createAction.data.list.name
        : (moveActions[0].data.listBefore && moveActions[0].data.listBefore.name);
      if (init) timeline.push({ list: init, date: new Date(createAction.date), duration: new Date(moveActions[0].date) - new Date(createAction.date) });
    }
    for (var i = 0; i < moveActions.length - 1; i++) {
      var diff = new Date(moveActions[i+1].date) - new Date(moveActions[i].date);
      if (diff > 0) timeline.push({ list: moveActions[i].data.listAfter.name, date: new Date(moveActions[i].date), duration: diff });
    }
    if (moveActions.length) {
      var last = moveActions[moveActions.length-1];
      timeline.push({ list: last.data.listAfter.name, date: new Date(last.date), duration: Date.now() - new Date(last.date) });
    }
    return timeline;
  }

  function buildTotals(timeline) {
    var totals = {};
    timeline.forEach(function(t) { totals[t.list] = (totals[t.list] || 0) + t.duration; });
    return totals;
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})();
