/* ---- section.js — card-section.html entry point ---- */

(function() {

  var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';

  var STRINGS = {
    en: {
      sinceCreation: 'Since Creation',
      currentStage: 'Current Stage', cardAge: 'Card Age',
      mostActive: 'Most Active', createdBy: 'Created By',
      timePerList: 'Time Per List', cardHistory: 'Card History',
      noData: 'No action data found for this card.',
      noChanges: 'No list changes yet.',
      couldNotLoad: 'Could not load data. Please refresh.',
      connectBtn: 'Connect Trello Account',
      connectMsg: 'Connect your Trello account to see card timing data.',
      doneBanner: '✓ This card is in a Done list — timers are frozen.',
      ignored: 'This list is set to ignore — no tracking here.',
      unknown: 'Unknown'
    },
    tr: {
      sinceCreation: 'Oluşturulmasından Bu Yana',
      currentStage: 'Mevcut Aşama', cardAge: 'Kart Yaşı',
      mostActive: 'En Aktif', createdBy: 'Kartı Açan',
      timePerList: 'Liste Bazlı Süre', cardHistory: 'Kart Geçmişi',
      noData: 'Bu kart için veri bulunamadı.',
      noChanges: 'Henüz liste değişimi yok.',
      couldNotLoad: 'Veri yüklenemedi. Lütfen sayfayı yenileyin.',
      connectBtn: 'Trello Hesabını Bağla',
      connectMsg: 'Kart verilerini görmek için Trello hesabınızı bağlayın.',
      doneBanner: '✓ Bu kart Tamamlandı listesinde — süreler donduruldu.',
      ignored: 'Bu liste yoksayılıyor — takip yapılmıyor.',
      unknown: 'Bilinmiyor'
    },
    es: {
      sinceCreation: 'Desde la Creación',
      currentStage: 'Etapa Actual', cardAge: 'Edad de la Tarjeta',
      mostActive: 'Más Activo', createdBy: 'Creado Por',
      timePerList: 'Tiempo por Lista', cardHistory: 'Historial',
      noData: 'No se encontraron datos para esta tarjeta.',
      noChanges: 'Sin cambios de lista aún.',
      couldNotLoad: 'No se pudieron cargar los datos. Actualiza la página.',
      connectBtn: 'Conectar Cuenta de Trello',
      connectMsg: 'Conecta tu cuenta de Trello para ver los datos de tiempo.',
      doneBanner: '✓ Esta tarjeta está en una lista Done — los temporizadores están congelados.',
      ignored: 'Esta lista está configurada para ignorar — sin seguimiento.',
      unknown: 'Desconocido'
    },
    pt: {
      sinceCreation: 'Desde a Criação',
      currentStage: 'Etapa Atual', cardAge: 'Idade do Cartão',
      mostActive: 'Mais Ativo', createdBy: 'Criado Por',
      timePerList: 'Tempo por Lista', cardHistory: 'Histórico',
      noData: 'Nenhum dado encontrado para este cartão.',
      noChanges: 'Sem alterações de lista ainda.',
      couldNotLoad: 'Não foi possível carregar os dados. Atualize a página.',
      connectBtn: 'Conectar Conta Trello',
      connectMsg: 'Conecte sua conta Trello para ver os dados de tempo.',
      doneBanner: '✓ Este cartão está em uma lista Done — os temporizadores estão congelados.',
      ignored: 'Esta lista está configurada para ignorar — sem rastreamento.',
      unknown: 'Desconhecido'
    }
  };

  var t = TrelloPowerUp.iframe({ appKey: API_KEY, appName: 'Time in List' });

  t.render(function() {
    return t.get('board', 'shared', 'language')
      .then(function(lang) {
        var L = STRINGS[lang] || STRINGS['en'];
        var restApi = t.getRestApi();
        return restApi.getToken()
          .then(function(token) {
            if (!token) return showAuth(L);
            return loadCard(token, L);
          })
          .catch(function() { return showAuth(L); });
      })
      .catch(function() {
        var L = STRINGS['en'];
        var restApi = t.getRestApi();
        return restApi.getToken()
          .then(function(token) {
            if (!token) return showAuth(L);
            return loadCard(token, L);
          })
          .catch(function() { return showAuth(L); });
      });
  });

  function showAuth(L) {
    var root = document.getElementById('root');
    root.innerHTML = '';
    var wrap = el('div', 'padding:16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;');
    var msg = el('div', 'font-size:13px;color:#5e6c84;margin-bottom:12px;');
    msg.innerText = L.connectMsg;
    var btn = el('button', 'background:#0052cc;color:white;border:none;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer');
    btn.innerText = L.connectBtn;
    btn.addEventListener('click', function() {
      t.getRestApi().authorize({ scope: 'read', expiration: 'never' })
        .then(function() { t.render(function() {}); });
    });
    wrap.appendChild(msg);
    wrap.appendChild(btn);
    root.appendChild(wrap);
    t.sizeTo('#root');
  }

  function loadCard(token, L) {
    return Promise.all([
      t.card('id', 'idList'),
      t.get('board', 'shared', 'listSettings'),
      t.lists('id', 'name')
    ]).then(function(results) {
      var card         = results[0];
      var listSettings = results[1] || {};
      var lists        = results[2] || [];
      var currentListObj  = lists.find(function(l) { return l.id === card.idList; });
      var currentListName = currentListObj ? currentListObj.name : '';
      var setting  = listSettings[currentListName] || {};
      var isDone   = setting.done   || false;
      var isIgnore = setting.ignore || false;

      if (isIgnore) {
        document.getElementById('root').innerHTML =
          '<div style="font-size:12px;color:#5e6c84;padding:16px">⊘ ' + L.ignored + '</div>';
        t.sizeTo('#root');
        return;
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
            '<div style="font-size:12px;color:#5e6c84;padding:16px">' + L.noData + '</div>';
          t.sizeTo('#root');
          return;
        }
        renderPanel(actions, isDone, L);
      });
    });
  }

  function renderPanel(actions, isDone, L) {
    var ordered      = actions.slice().reverse();
    var moveActions  = ordered.filter(function(a){ return a.data && a.data.listAfter; });
    var createAction = ordered.find(function(a){ return a.type === 'createCard'; });

    var lastMove = moveActions.length
      ? moveActions[moveActions.length - 1]
      : (createAction || ordered[ordered.length - 1]);

    var currentList = (lastMove.data && lastMove.data.listAfter)
      ? lastMove.data.listAfter.name
      : (createAction && createAction.data && createAction.data.list
        ? createAction.data.list.name : L.unknown);

    var frozenAt         = isDone ? new Date(lastMove.date) : new Date();
    var currentStageTime = frozenAt - new Date(lastMove.date);
    var totalTime        = Date.now() - new Date(ordered[0].date);

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

    var timeline   = buildTimeline(ordered, isDone);
    var totals     = buildTotals(timeline);
    var listKeys   = Object.keys(totals);
    var grandTotal = listKeys.reduce(function(s, k){ return s + totals[k]; }, 0);
    var COLORS     = ['#0052cc','#2ea043','#f2cc60','#db61a2','#ff7b72'];
    var colorMap   = {};
    listKeys.forEach(function(list, i){ colorMap[list] = COLORS[i % COLORS.length]; });

    var root = document.getElementById('root');
    root.innerHTML = '';
    var wrap = el('div', 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;flex-direction:column;gap:8px;padding:2px');

    if (isDone) {
      var banner = el('div', 'background:#e3fcef;border:1px solid #abf5d1;border-radius:8px;padding:10px 14px;font-size:12px;color:#006644;font-weight:500;');
      banner.innerText = L.doneBanner;
      wrap.appendChild(banner);
    }

    var row1 = el('div', 'display:grid;grid-template-columns:1fr 1fr;gap:8px;');
    var stageColor = isDone ? '#5e6c84' : '#2ea043';
    row1.appendChild(infoCard(
      '⏱', L.currentStage,
      '<div style="font-size:13px;font-weight:600;color:#172b4d;margin-bottom:3px">' + escHtml(currentList) + '</div>' +
      '<div style="font-size:16px;font-weight:700;color:' + stageColor + ';line-height:1.2">' + formatTime(currentStageTime) + '</div>'
    ));
    row1.appendChild(infoCard(
      '📊', L.cardAge,
      '<div style="font-size:13px;font-weight:600;color:#172b4d;margin-bottom:3px">' + L.sinceCreation + '</div>' +
      '<div style="font-size:16px;font-weight:700;color:#0052cc;line-height:1.2">' + formatTime(totalTime) + '</div>'
    ));
    wrap.appendChild(row1);

    if (mostActive || createdBy) {
      var row2 = el('div', 'display:grid;grid-template-columns:1fr 1fr;gap:8px;');
      if (mostActive) {
        row2.appendChild(infoCard(
          '👤', L.mostActive,
          '<div style="font-size:14px;font-weight:600;color:#172b4d">' + escHtml(mostActive) +
          ' <span style="color:#5e6c84;font-weight:400;font-size:12px">(' + mostActiveCount + ')</span></div>'
        ));
      }
      if (createdBy) {
        row2.appendChild(infoCard(
          '⭐', L.createdBy,
          '<div style="font-size:14px;font-weight:600;color:#172b4d">' + escHtml(createdBy) + '</div>'
        ));
      }
      wrap.appendChild(row2);
    }

    // Time Per List - collapsible
    if (timeline.length && listKeys.length) {
      var timeCard = el('div', 'background:#f4f5f7;border:1px solid #dfe1e6;border-radius:8px;overflow:hidden;');
      var timeHead = el('div', 'display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer;user-select:none;');
      var timeLbl  = el('span', 'font-size:10px;font-weight:700;color:#5e6c84;text-transform:uppercase;letter-spacing:0.6px;');
      timeLbl.innerText = '📋 ' + L.timePerList;
      var timeArrow = el('span', 'font-size:9px;color:#5e6c84;transition:transform 0.2s;');
      timeArrow.innerText = '▶';
      timeHead.appendChild(timeLbl);
      timeHead.appendChild(timeArrow);
      timeCard.appendChild(timeHead);

      var timeBody = el('div', 'overflow:hidden;max-height:0;transition:max-height 0.25s ease;padding:0 14px;');
      listKeys.forEach(function(list) {
        var color = colorMap[list];
        var pct   = grandTotal > 0 ? (totals[list] / grandTotal * 100) : 0;
        var row = el('div', 'margin-bottom:10px;');
        var meta = el('div', 'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;');
        var nameEl = el('span', 'font-size:12px;font-weight:500;color:#172b4d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%;');
        nameEl.innerText = list;
        var right = el('div', 'display:flex;gap:8px;align-items:center;flex-shrink:0;');
        var pctEl = el('span', 'font-size:11px;font-weight:700;color:' + color + ';min-width:32px;text-align:right;');
        pctEl.innerText = Math.round(pct) + '%';
        var timeEl = el('span', 'font-size:11px;color:#5e6c84;white-space:nowrap;');
        timeEl.innerText = formatTime(totals[list]);
        right.appendChild(pctEl);
        right.appendChild(timeEl);
        meta.appendChild(nameEl);
        meta.appendChild(right);
        var track = el('div', 'height:6px;background:#dfe1e6;border-radius:6px;overflow:hidden;');
        var fill  = el('div', 'height:100%;background:' + color + ';width:' + pct + '%;border-radius:6px;');
        track.appendChild(fill);
        row.appendChild(meta);
        row.appendChild(track);
        timeBody.appendChild(row);
      });
      timeCard.appendChild(timeBody);
      wrap.appendChild(timeCard);

      var timeOpen = false;
      timeHead.addEventListener('click', function() {
        timeOpen = !timeOpen;
        if (timeOpen) {
          timeBody.style.maxHeight = timeBody.scrollHeight + 'px';
          timeBody.style.paddingBottom = '12px';
          timeArrow.style.transform = 'rotate(90deg)';
        } else {
          timeBody.style.maxHeight = '0';
          timeBody.style.paddingBottom = '0';
          timeArrow.style.transform = 'rotate(0deg)';
        }
        setTimeout(function(){ t.sizeTo('#root'); }, 300);
      });
    }

    // Card History - collapsible
    if (timeline.length) {
      var histCard = el('div', 'background:#f4f5f7;border:1px solid #dfe1e6;border-radius:8px;overflow:hidden;');
      var histHead = el('div', 'display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer;user-select:none;');
      var histLbl  = el('span', 'font-size:10px;font-weight:700;color:#5e6c84;text-transform:uppercase;letter-spacing:0.6px;');
      histLbl.innerText = '≡ ' + L.cardHistory;
      var arrow = el('span', 'font-size:9px;color:#5e6c84;transition:transform 0.2s;');
      arrow.innerText = '▶';
      histHead.appendChild(histLbl);
      histHead.appendChild(arrow);
      var histBody = el('div', 'overflow:hidden;max-height:0;transition:max-height 0.25s ease;padding:0 14px;');
      timeline.forEach(function(item, idx) {
        var color  = colorMap[item.list] || COLORS[0];
        var isLast = idx === timeline.length - 1;
        var row    = el('div', 'display:flex;gap:8px;padding-bottom:10px;');
        var lineCol = el('div', 'display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:10px;');
        var dot  = el('div', 'width:8px;height:8px;border-radius:50%;background:' + color + ';flex-shrink:0;margin-top:2px;');
        var line = el('div', 'width:2px;flex:1;background:' + (isLast ? 'transparent' : '#dfe1e6') + ';margin-top:3px;');
        lineCol.appendChild(dot);
        lineCol.appendChild(line);
        var content = el('div', 'flex:1;min-width:0;');
        var listName = el('div', 'font-size:12px;font-weight:600;color:#172b4d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;');
        listName.innerText = item.list;
        var meta = el('div', 'font-size:10px;color:#5e6c84;margin-top:2px;');
        meta.innerText = (item.date ? formatDate(item.date) + ' · ' : '') + formatTime(item.duration);
        content.appendChild(listName);
        content.appendChild(meta);
        row.appendChild(lineCol);
        row.appendChild(content);
        histBody.appendChild(row);
      });
      var open = false;
      histHead.addEventListener('click', function() {
        open = !open;
        if (open) {
          histBody.style.maxHeight = histBody.scrollHeight + 'px';
          histBody.style.paddingBottom = '12px';
          arrow.style.transform = 'rotate(90deg)';
        } else {
          histBody.style.maxHeight = '0';
          histBody.style.paddingBottom = '0';
          arrow.style.transform = 'rotate(0deg)';
        }
        setTimeout(function(){ t.sizeTo('#root'); }, 300);
      });
      histCard.appendChild(histHead);
      histCard.appendChild(histBody);
      wrap.appendChild(histCard);
    }

    root.appendChild(wrap);
    t.sizeTo('#root');
  }

  function infoCard(icon, label, valueHTML) {
    var card = el('div', 'background:#f4f5f7;border:1px solid #dfe1e6;border-radius:8px;padding:14px;');
    var lbl  = el('div', 'font-size:10px;font-weight:700;color:#5e6c84;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;display:flex;align-items:center;gap:4px;');
    lbl.innerHTML = icon + ' ' + label;
    card.appendChild(lbl);
    var val = el('div', '');
    val.innerHTML = valueHTML;
    card.appendChild(val);
    return card;
  }

  function el(tag, css) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    return e;
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

  function buildTimeline(actions, isDone) {
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
      var last    = moveActions[moveActions.length - 1];
      var endTime = isDone ? new Date(last.date) : new Date();
      var dur     = endTime - new Date(last.date);
      if (dur >= 0) timeline.push({ list: last.data.listAfter.name, date: new Date(last.date), duration: dur });
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
