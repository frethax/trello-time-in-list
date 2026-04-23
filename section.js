/* ---- section.js — card-section.html entry point ---- */

(function() {

  var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';

  var t = TrelloPowerUp.iframe({
    appKey:  API_KEY,
    appName: 'Time in List'
  });

  t.render(function() {
    return t.card('id').then(function(card) {
      return fetch(
        'https://api.trello.com/1/cards/' + card.id +
        '/actions?filter=updateCard:idList,createCard&key=' + API_KEY
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
        var timeline = buildTimeline(ordered);
        var totals   = buildTotals(timeline);

        var lastMove    = ordered[ordered.length - 1];
        var createAct   = ordered[0];
        var currentList = (lastMove.data && lastMove.data.listAfter)
          ? lastMove.data.listAfter.name : 'Unknown';
        var currentStageTime = Date.now() - new Date(lastMove.date);
        var totalTime        = Date.now() - new Date(createAct.date);

        var listKeys   = Object.keys(totals);
        var grandTotal = listKeys.reduce(function(s,k){ return s + totals[k]; }, 0);
        var colorMap   = {};
        listKeys.forEach(function(list, i){ colorMap[list] = COLORS[i % COLORS.length]; });

        var root = document.getElementById('root');
        root.innerHTML = '';

        var panel = document.createElement('div');
        panel.className = 'panel';

        var left = document.createElement('div');
        left.className = 'card';
        left.innerHTML = [
          '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #dfe1e6">',
            '<div class="label">⏱ Current Stage</div>',
            '<div class="list-name">' + escHtml(currentList) + '</div>',
            '<div class="time-green">' + formatTime(currentStageTime) + '</div>',
          '</div>',
          '<div>',
            '<div class="label">📊 Total Time</div>',
            '<div class="time-blue">' + formatTime(totalTime) + '</div>',
          '</div>'
        ].join('');

        var right = document.createElement('div');
        right.className = 'card right-card';

        if (!timeline.length) {
          right.innerHTML = '<div class="empty">No list changes yet.</div>';
        } else {
          var barsHtml = '<div class="section-title">Time per list</div>';
          listKeys.forEach(function(list) {
            var color = colorMap[list];
            var pct   = grandTotal > 0 ? (totals[list] / grandTotal * 100) : 0;
            barsHtml += [
              '<div class="bar-row">',
                '<div class="bar-meta">',
                  '<span class="bar-name">' + escHtml(list) + '</span>',
                  '<div class="bar-right">',
                    '<span class="bar-pct" style="color:' + color + '">' + Math.round(pct) + '%</span>',
                    '<span class="bar-time">' + formatTime(totals[list]) + '</span>',
                  '</div>',
                '</div>',
                '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>',
              '</div>'
            ].join('');
          });

          right.innerHTML = barsHtml;

          var divider = document.createElement('hr');
          divider.className = 'divider';
          right.appendChild(divider);

          var histTitle = document.createElement('div');
          histTitle.className = 'history-title';
          histTitle.innerHTML = '<span class="history-label">📋 Card History</span><span class="arrow" id="arrow">▶</span>';
          right.appendChild(histTitle);

          var tlList = document.createElement('div');
          tlList.className = 'timeline-list';
          tlList.id = 'tl-list';

          timeline.forEach(function(item, idx) {
            var color  = colorMap[item.list] || COLORS[0];
            var isLast = idx === timeline.length - 1;
            var el     = document.createElement('div');
            el.className = 'tl-item';
            el.innerHTML = [
              '<div class="tl-line-col">',
                '<div class="tl-dot" style="background:' + color + '"></div>',
                '<div class="tl-line" style="background:' + (isLast ? 'transparent' : '#dfe1e6') + '"></div>',
              '</div>',
              '<div class="tl-content">',
                '<div class="tl-name">' + escHtml(item.list) + '</div>',
                '<div class="tl-meta">' + (item.date ? formatDate(item.date) + ' · ' : '') + formatTime(item.duration) + '</div>',
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
              tlList.style.marginTop = '10px';
              arrow.style.transform  = 'rotate(90deg)';
            } else {
              tlList.style.maxHeight = '0';
              tlList.style.marginTop = '0';
              arrow.style.transform  = 'rotate(0deg)';
            }
            setTimeout(function(){ t.sizeTo('#root'); }, 300);
          });
        }

        panel.appendChild(left);
        panel.appendChild(right);
        root.appendChild(panel);
        t.sizeTo('#root');
      })
      .catch(function() {
        document.getElementById('root').innerHTML =
          '<div class="empty">Could not load data. Please refresh.</div>';
        t.sizeTo('#root');
      });
    });
  });

  function escHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

})();
