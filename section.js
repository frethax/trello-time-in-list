/* ---- section.js — card-section.html entry point ---- */

(function() {

  var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';
  var TOKEN   = 'ATTAb3f19050ede7315f2f82e741927c18df02df27bcb298ea151a7f956bd366c9acFAC5ADD9';

  var t = TrelloPowerUp.iframe({
    appKey:  API_KEY,
    appName: 'Time in List'
  });

  t.render(function() {
    return t.card('id').then(function(card) {
      return fetch(
        'https://api.trello.com/1/cards/' + card.id +
        '/actions?filter=updateCard:idList,createCard,commentCard,addMemberToCard&key=' + API_KEY + '&token=' + TOKEN
      )
      .then(function(r) { return r.json(); })
      .then(function(actions) {
        if (!actions || !actions.length) {
          document.getElementById('root').innerHTML =
            '<div class="empty">No action data found for this card.</div>';
          t.sizeTo('#root');
          return;
        }

        var ordered  = actions.slice().reverse();

        // Current stage
        var moveActions = ordered.filter(function(a){ return a.data && a.data.listAfter; });
        var createAction = ordered.find(function(a){ return a.type === 'createCard'; });

        var lastMove = moveActions.length ? moveActions[moveActions.length-1] : (createAction || ordered[ordered.length-1]);
        var currentList = (lastMove.data && lastMove.data.listAfter) ? lastMove.data.listAfter.name : 'Unknown';
        var currentStageTime = Date.now() - new Date(lastMove.date);

        // Total time
        var firstAction = ordered[0];
        var totalTime = Date.now() - new Date(firstAction.date);

        // Created by
        var createdBy = '';
        if (createAction && createAction.memberCreator) {
          createdBy = createAction.memberCreator.fullName || createAction.memberCreator.username || '';
        }

        // Most active
        var activityCount = {};
        ordered.forEach(function(a) {
          if (a.memberCreator) {
            var name = a.memberCreator.fullName || a.memberCreator.username || '';
            if (name) activityCount[name] = (activityCount[name] || 0) + 1;
          }
        });
        var mostActive = '';
        var mostActiveCount = 0;
        Object.keys(activityCount).forEach(function(name) {
          if (activityCount[name] > mostActiveCount) {
            mostActive = name;
            mostActiveCount = activityCount[name];
          }
        });

        // Timeline
        var timeline = buildTimeline(ordered);
        var totals   = buildTotals(timeline);
        var listKeys = Object.keys(totals);
        var grandTotal = listKeys.reduce(function(s,k){ return s + totals[k]; }, 0);
        var COLORS = ['#0052cc','#2ea043','#f2cc60','#db61a2','#ff7b72'];
        var colorMap = {};
        listKeys.forEach(function(list, i){ colorMap[list] = COLORS[i % COLORS.length]; });

        // Build UI
        var root = document.getElementById('root');
        root.innerHTML = '';

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:13px;';

        // LEFT PANEL
        var left = document.createElement('div');
        left.style.cssText = 'background:#f4f5f7;border:1px solid #dfe1e6;border-radius:8px;padding:12px;';

        var leftHTML = '';

        // Current Stage
        leftHTML += '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #dfe1e6">';
        leftHTML += '<div style="font-size:10px;font-weight:600;color:#5e6c84;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">⏱ Current Stage</div>';
        leftHTML += '<div style="font-size:13px;font-weight:600;color:#172b4d;margin-bottom:1px">' + escHtml(currentList) + '</div>';
        leftHTML += '<div style="font-size:16px;font-weight:700;color:#2ea043">' + formatTime(currentStageTime) + '</div>';
        leftHTML += '</div>';

        // Card Age (total)
        leftHTML += '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #dfe1e6">';
        leftHTML += '<div style="font-size:10px;font-weight:600;color:#5e6c84;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">📊 Card Age</div>';
        leftHTML += '<div style="font-size:16px;font-weight:700;color:#0052cc">' + formatTime(totalTime) + '</div>';
        leftHTML += '</div>';

        // Most Active
        if (mostActive) {
          leftHTML += '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #dfe1e6">';
          leftHTML += '<div style="font-size:10px;font-weight:600;color:#5e6c84;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">👤 Most Active</div>';
          leftHTML += '<div style="font-size:13px;font-weight:600;color:#172b4d">' + escHtml(mostActive) + ' (' + mostActiveCount + ')</div>';
          leftHTML += '</div>';
        }

        // Created By
        if (createdBy) {
          leftHTML += '<div>';
          leftHTML += '<div style="font-size:10px;font-weight:600;color:#5e6c84;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">⭐ Created By</div>';
          leftHTML += '<div style="font-size:13px;font-weight:600;color:#172b4d">' + escHtml(createdBy) + '</div>';
          leftHTML += '</div>';
        }

        left.innerHTML = leftHTML;

        // RIGHT PANEL
        var right = document.createElement('div');
        right.style.cssText = 'background:#f4f5f7;border:1px solid #dfe1e6;border-radius:8px;padding:12px;';

        if (!timeline.length) {
          right.innerHTML = '<div style="font-size:12px;color:#5e6c84">No list changes yet.</div>';
        } else {
          var rightHTML = '<div style="font-size:10px;font-weight:600;color:#5e6c84;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📋 Time Per List</div>';

          listKeys.forEach(function(list) {
            var color = colorMap[list];
            var pct   = grandTotal > 0 ? (totals[list] / grandTotal * 100) : 0;
            rightHTML += '<div style="margin-bottom:7px">';
            rightHTML += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">';
            rightHTML += '<span style="font-size:11px;color:#172b4d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55%">' + escHtml(list) + '</span>';
            rightHTML += '<div style="display:flex;gap:5px;align-items:center;flex-shrink:0">';
            rightHTML += '<span style="font-size:10px;font-weight:700;color:' + color + '">' + Math.round(pct) + '%</span>';
            rightHTML += '<span style="font-size:11px;color:#5e6c84;white-space:nowrap">' + formatTime(totals[list]) + '</span>';
            rightHTML += '</div></div>';
            rightHTML += '<div style="height:6px;background:#dfe1e6;border-radius:6px;overflow:hidden">';
            rightHTML += '<div style="height:100%;background:' + color + ';width:' + pct + '%;border-radius:6px"></div>';
            rightHTML += '</div></div>';
          });

          right.innerHTML = rightHTML;

          // Card History collapsible
          var divider = document.createElement('div');
          divider.style.cssText = 'border-top:1px solid #dfe1e6;margin:8px 0;';
          right.appendChild(divider);

          var histTitle = document.createElement('div');
          histTitle.style.cssText = 'display:flex;justify-content:space-between;align-items:center;cursor:pointer;user-select:none;';
          histTitle.innerHTML = '<span style="font-size:10px;font-weight:600;color:#5e6c84;text-transform:uppercase;letter-spacing:0.5px">≡ Card History</span><span id="arrow" style="font-size:9px;color:#5e6c84;transition:transform 0.2s">▶</span>';
          right.appendChild(histTitle);

          var tlList = document.createElement('div');
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
                '<div style="font-size:11px;font-weight:600;color:#172b4d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(item.list) + '</div>',
                '<div style="font-size:10px;color:#5e6c84;margin-top:1px">' + (item.date ? formatDate(item.date) + ' · ' : '') + formatTime(item.duration) + '</div>',
              '</div>'
            ].join('');
            tlList.appendChild(el);
          });

          right.appendChild(tlList);

          var open = false;
          histTitle.addEventListener('click', function() {
            open = !open;
            var arrow = document.getElementById('arrow');
            if (open) {
              tlList.style.maxHeight = tlList.scrollHeight + 'px';
              tlList.style.marginTop = '8px';
              if (arrow) arrow.style.transform = 'rotate(90deg)';
            } else {
              tlList.style.maxHeight = '0';
              tlList.style.marginTop = '0';
              if (arrow) arrow.style.transform = 'rotate(0deg)';
            }
            setTimeout(function(){ t.sizeTo('#root'); }, 300);
          });
        }

        wrapper.appendChild(left);
        wrapper.appendChild(right);
        root.appendChild(wrapper);
        t.sizeTo('#root');
      })
      .catch(function(err) {
        document.getElementById('root').innerHTML =
          '<div class="empty">Could not load data. Please refresh.</div>';
        t.sizeTo('#root');
      });
    });
  });

  function formatTime(ms) {
    var minutes = Math.floor(ms / (1000 * 60));
    var hours   = Math.floor(ms / (1000 * 60 * 60));
    var days    = Math.floor(hours / 24);
    var rest    = hours % 24;
    if (minutes < 60) return minutes + 'm';
    if (days > 0 && rest > 0) return days + 'd ' + rest + 'h';
    if (days > 0) return days + 'd';
    return hours + 'h';
  }

  function formatDate(d) {
    var dt = new Date(d);
    var day = String(dt.getDate()).padStart(2,'0');
    var mon = String(dt.getMonth()+1).padStart(2,'0');
    var h   = String(dt.getHours()).padStart(2,'0');
    var min = String(dt.getMinutes()).padStart(2,'0');
    return day + '.' + mon + ' ' + h + ':' + min;
  }

  function buildTimeline(actions) {
    var timeline = [];
    var createAction = null;
    var moveActions  = [];
    actions.forEach(function(a) {
      if (a.type === 'createCard') createAction = a;
      else if (a.data && a.data.listAfter) moveActions.push(a);
    });
    if (createAction && moveActions.length) {
      var initialList = (createAction.data && createAction.data.list)
        ? createAction.data.list.name
        : (moveActions[0].data.listBefore && moveActions[0].data.listBefore.name);
      if (initialList) {
        timeline.push({ list: initialList, date: new Date(createAction.date), duration: new Date(moveActions[0].date) - new Date(createAction.date) });
      }
    }
    for (var i = 0; i < moveActions.length - 1; i++) {
      var a = moveActions[i], b = moveActions[i+1];
      var diff = new Date(b.date) - new Date(a.date);
      if (diff > 0) timeline.push({ list: a.data.listAfter.name, date: new Date(a.date), duration: diff });
    }
    if (moveActions.length) {
      var last = moveActions[moveActions.length-1];
      timeline.push({ list: last.data.listAfter.name, date: new Date(last.date), duration: Date.now() - new Date(last.date) });
    }
    return timeline;
  }

  function buildTotals(timeline) {
    var totals = {};
    timeline.forEach(function(t) {
      if (!totals[t.list]) totals[t.list] = 0;
      totals[t.list] += t.duration;
    });
    return totals;
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})();
