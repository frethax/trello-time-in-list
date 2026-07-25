/* ---- settings.js — ListClock configuration ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';
var t = TrelloPowerUp.iframe({ appKey: API_KEY, appName: 'ListClock' });

var STRINGS = {
  en: {
    langTitle:   'Language',
    listsTitle:  'List Settings',
    days:        'days',
    doneLabel:   '✓ Done',
    ignoreLabel: '⊘ Ignore',
    save:        'Save Settings',
    loading:     'Loading...',
    error:       'Could not load lists. Please reconnect your account.',
    helpFlag:    '🚩 Flag — Cards in this list will turn red after the set number of days.',
    helpDone:    '✓ Done — Cards moved here stop accumulating time. Their timer freezes.',
    helpIgnore:  '⊘ Ignore — Cards in this list are hidden from the ListClock panel and badge.',
    exportTitle:    'Export Data',
    exportCsvBtn:   'Download as CSV',
    exportXlsxBtn:  'Download as Excel',
    exportFetching: 'Scanning cards...',
    exportBuilding: 'Preparing file...',
    exportDone:     '{n} cards exported.',
    exportEmpty:    'No cards found to export.',
    exportError:    'Export failed. Please try again.',
    contactTitle:   'Contact',
    contactBtn:     'Contact Us',
    connectMsg:     'Connect your Trello account to load and export list data.',
    connectBtn:     'Connect Trello Account'
  },
  tr: {
    langTitle:   'Dil',
    listsTitle:  'Liste Ayarları',
    days:        'gün',
    doneLabel:   '✓ Tamamlandı',
    ignoreLabel: '⊘ Yoksay',
    save:        'Kaydet',
    loading:     'Yükleniyor...',
    error:       'Listeler yüklenemedi. Lütfen hesabınızı yeniden bağlayın.',
    helpFlag:    '🚩 İşaretle — Bu listedeki kartlar belirlenen gün sayısını aşınca kırmızıya döner.',
    helpDone:    '✓ Tamamlandı — Buraya taşınan kartların süresi dondurulur. Sayaç durur.',
    helpIgnore:  '⊘ Yoksay — Bu listedeki kartlar ListClock panelinde ve badge\'de gösterilmez.',
    exportTitle:    'Veri Dışa Aktar',
    exportCsvBtn:   'CSV olarak indir',
    exportXlsxBtn:  'Excel olarak indir',
    exportFetching: 'Kartlar taranıyor...',
    exportBuilding: 'Dosya hazırlanıyor...',
    exportDone:     '{n} kart dışa aktarıldı.',
    exportEmpty:    'Dışa aktarılacak kart bulunamadı.',
    exportError:    'Dışa aktarma başarısız oldu. Lütfen tekrar deneyin.',
    contactTitle:   'İletişim',
    contactBtn:     'Bize Ulaşın',
    connectMsg:     'Liste verilerini yükleyip dışa aktarmak için Trello hesabınızı bağlayın.',
    connectBtn:     'Trello Hesabını Bağla'
  },
  es: {
    langTitle:   'Idioma',
    listsTitle:  'Configuración de listas',
    days:        'días',
    doneLabel:   '✓ Hecho',
    ignoreLabel: '⊘ Ignorar',
    save:        'Guardar',
    loading:     'Cargando...',
    error:       'No se pudieron cargar las listas.',
    helpFlag:    '🚩 Marcar — Las tarjetas en esta lista se volverán rojas después del número de días establecido.',
    helpDone:    '✓ Hecho — Las tarjetas movidas aquí dejan de acumular tiempo. El temporizador se congela.',
    helpIgnore:  '⊘ Ignorar — Las tarjetas en esta lista se ocultan del panel y la insignia de ListClock.',
    exportTitle:    'Exportar Datos',
    exportCsvBtn:   'Descargar como CSV',
    exportXlsxBtn:  'Descargar como Excel',
    exportFetching: 'Escaneando tarjetas...',
    exportBuilding: 'Preparando archivo...',
    exportDone:     '{n} tarjetas exportadas.',
    exportEmpty:    'No se encontraron tarjetas para exportar.',
    exportError:    'Error al exportar. Inténtalo de nuevo.',
    contactTitle:   'Contacto',
    contactBtn:     'Contáctanos',
    connectMsg:     'Conecta tu cuenta de Trello para cargar y exportar los datos de las listas.',
    connectBtn:     'Conectar Cuenta de Trello'
  },
  pt: {
    langTitle:   'Idioma',
    listsTitle:  'Configurações de listas',
    days:        'dias',
    doneLabel:   '✓ Concluído',
    ignoreLabel: '⊘ Ignorar',
    save:        'Salvar',
    loading:     'Carregando...',
    error:       'Não foi possível carregar as listas.',
    helpFlag:    '🚩 Sinalizar — Os cartões nesta lista ficarão vermelhos após o número de dias definido.',
    helpDone:    '✓ Concluído — Os cartões movidos aqui param de acumular tempo. O cronômetro congela.',
    helpIgnore:  '⊘ Ignorar — Os cartões nesta lista ficam ocultos do painel e do badge do ListClock.',
    exportTitle:    'Exportar Dados',
    exportCsvBtn:   'Baixar como CSV',
    exportXlsxBtn:  'Baixar como Excel',
    exportFetching: 'Escaneando cartões...',
    exportBuilding: 'Preparando arquivo...',
    exportDone:     '{n} cartões exportados.',
    exportEmpty:    'Nenhum cartão encontrado para exportar.',
    exportError:    'Falha ao exportar. Tente novamente.',
    contactTitle:   'Fale Conosco',
    contactBtn:     'Fale Conosco',
    connectMsg:     'Conecte sua conta Trello para carregar e exportar os dados das listas.',
    connectBtn:     'Conectar Conta Trello'
  }
};

var LANGS = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' }
];

document.addEventListener('DOMContentLoaded', function() {
  LANGS.forEach(function(l) {
    var btn = document.getElementById('lang-' + l.code);
    if (btn) btn.addEventListener('click', function() { setLang(l.code); });
  });

  var csvBtn   = document.getElementById('export-csv');
  var xlsxBtn  = document.getElementById('export-xlsx');
  if (csvBtn)  csvBtn.addEventListener('click', function() { runExport('csv'); });
  if (xlsxBtn) xlsxBtn.addEventListener('click', function() { runExport('xlsx'); });
});

var currentLang = 'en', boardLists = [], listSettings = {};
var currentToken = null, currentBoardId = null, isExporting = false;

window.setLang = function(lang) {
  currentLang = lang;
  LANGS.forEach(function(l) {
    var btn = document.getElementById('lang-' + l.code);
    if (btn) btn.className = 'lang-btn' + (l.code === lang ? ' active' : '');
  });
  applyStrings();
  renderLists();
};

function applyStrings() {
  var s = STRINGS[currentLang];
  document.getElementById('lang-title').innerText  = s.langTitle;
  document.getElementById('lists-title').innerText = s.listsTitle;
  document.getElementById('help-flag').innerText   = s.helpFlag;
  document.getElementById('help-done').innerText   = s.helpDone;
  document.getElementById('help-ignore').innerText = s.helpIgnore;
  var saveBtn = document.getElementById('save');
  if (saveBtn) saveBtn.innerText = s.save;

  var exportTitleEl = document.getElementById('export-title');
  var csvBtn  = document.getElementById('export-csv');
  var xlsxBtn = document.getElementById('export-xlsx');
  if (exportTitleEl) exportTitleEl.innerText = s.exportTitle;
  if (csvBtn)  csvBtn.innerText  = s.exportCsvBtn;
  if (xlsxBtn) xlsxBtn.innerText = s.exportXlsxBtn;

  var contactTitleEl = document.getElementById('contact-title');
  var contactLabel   = document.getElementById('contact-label');
  if (contactTitleEl) contactTitleEl.innerText = s.contactTitle;
  if (contactLabel)   contactLabel.innerText   = s.contactBtn;
}

function updatePill(input) {
  var pill = input.closest ? input.closest('.flag-pill') : input.parentNode;
  if (input.value && parseInt(input.value) > 0) {
    pill.className = 'flag-pill active';
  } else {
    pill.className = 'flag-pill';
  }
}

function makeToggle(checked, name, cls) {
  var label = document.createElement('label');
  label.className = 'toggle';
  var cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = checked;
  cb.dataset.name = name;
  cb.className = cls;
  var slider = document.createElement('span');
  slider.className = 'slider';
  label.appendChild(cb);
  label.appendChild(slider);
  return label;
}

function renderLists() {
  var s = STRINGS[currentLang];
  var container = document.getElementById('lists');
  container.innerHTML = '';

  boardLists.forEach(function(list) {
    var saved = listSettings[list.name] || { done: false, ignore: false, threshold: '' };

    var item = document.createElement('div');
    item.className = 'list-item' + (saved.ignore ? ' ignored' : '');

    var nameSpan = document.createElement('span');
    nameSpan.className = 'list-name';
    nameSpan.innerText = list.name;
    nameSpan.title = list.name;

    var controls = document.createElement('div');
    controls.className = 'item-controls';

    var pill = document.createElement('div');
    pill.className = 'flag-pill' + (saved.threshold ? ' active' : '');
    var flagIcon = document.createElement('span');
    flagIcon.className = 'flag-icon';
    flagIcon.innerText = '🚩';
    var input = document.createElement('input');
    input.type = 'number';
    input.min = '1'; input.max = '999';
    input.placeholder = '—';
    input.value = saved.threshold || '';
    input.dataset.name = list.name;
    input.className = 'threshold-input';
    input.addEventListener('input', function() { updatePill(this); });
    var daysLbl = document.createElement('span');
    daysLbl.className = 'control-label';
    daysLbl.innerText = s.days;
    pill.appendChild(flagIcon);
    pill.appendChild(input);
    pill.appendChild(daysLbl);

    var sep1 = document.createElement('div');
    sep1.className = 'separator';

    var doneLbl = document.createElement('span');
    doneLbl.className = 'control-label';
    doneLbl.innerText = s.doneLabel;
    var doneToggle = makeToggle(saved.done || false, list.name, 'done-checkbox');

    var sep2 = document.createElement('div');
    sep2.className = 'separator';

    var ignoreLbl = document.createElement('span');
    ignoreLbl.className = 'control-label';
    ignoreLbl.innerText = s.ignoreLabel;
    var ignoreToggle = makeToggle(saved.ignore || false, list.name, 'ignore-checkbox');

    ignoreToggle.querySelector('input').addEventListener('change', function() {
      item.className = 'list-item' + (this.checked ? ' ignored' : '');
    });

    controls.appendChild(pill);
    controls.appendChild(sep1);
    controls.appendChild(doneLbl);
    controls.appendChild(doneToggle);
    controls.appendChild(sep2);
    controls.appendChild(ignoreLbl);
    controls.appendChild(ignoreToggle);

    item.appendChild(nameSpan);
    item.appendChild(controls);
    container.appendChild(item);
  });
}

function showConnectGate() {
  var s = STRINGS[currentLang];
  var container = document.getElementById('lists');
  container.innerHTML = '';
  var msg = document.createElement('div');
  msg.style.cssText = 'font-size:12px;color:#5e6c84;margin-bottom:10px;';
  msg.innerText = s.connectMsg;
  var btn = document.createElement('button');
  btn.className = 'save-btn';
  btn.innerText = s.connectBtn;
  btn.addEventListener('click', function() {
    t.getRestApi().authorize({ scope: 'read', expiration: 'never' }).then(function() {
      t.render(function() {});
    });
  });
  container.appendChild(msg);
  container.appendChild(btn);
  setExportButtonsDisabled(true);
}

t.render(function() {
  var restApi = t.getRestApi();
  return restApi.getToken().then(function(token) {
    if (!token) {
      showConnectGate();
      return;
    }
    currentToken = token;
    return Promise.all([
      t.board('id'),
      t.get('board', 'shared', 'listSettings'),
      t.get('board', 'shared', 'language')
    ]).then(function(results) {
      var boardId   = results[0].id;
      currentBoardId = boardId;
      listSettings  = results[1] || {};
      var savedLang = results[2] || 'en';
      currentLang   = savedLang;
      LANGS.forEach(function(l) {
        var btn = document.getElementById('lang-' + l.code);
        if (btn) btn.className = 'lang-btn' + (l.code === savedLang ? ' active' : '');
      });
      applyStrings();
      return fetch(
        'https://api.trello.com/1/boards/' + boardId +
        '/lists?key=' + API_KEY + '&token=' + token
      )
      .then(function(r) {
        if (!r.ok) {
          // 401/invalid token → token is stale, prompt reconnect
          if (r.status === 401) { showConnectGate(); return null; }
          throw new Error('Lists request failed with status ' + r.status);
        }
        return r.json();
      })
      .then(function(lists) {
        if (lists === null) return; // handled by showConnectGate
        boardLists = lists;
        renderLists();
        document.getElementById('save').style.display = 'block';
        applyStrings();
      });
    });
  }).catch(function(err) {
    console.error('[ListClock] settings load failed:', err);
    document.getElementById('lists').innerHTML =
      '<div class="loading">' + STRINGS[currentLang].error + '</div>';
  });
});

document.getElementById('save').addEventListener('click', function() {
  var settings = {};
  document.querySelectorAll('.threshold-input').forEach(function(input) {
    var name = input.dataset.name;
    if (!settings[name]) settings[name] = { done: false, ignore: false, threshold: '' };
    settings[name].threshold = input.value ? parseInt(input.value) : '';
  });
  document.querySelectorAll('.done-checkbox').forEach(function(cb) {
    var name = cb.dataset.name;
    if (!settings[name]) settings[name] = { done: false, ignore: false, threshold: '' };
    settings[name].done = cb.checked;
  });
  document.querySelectorAll('.ignore-checkbox').forEach(function(cb) {
    var name = cb.dataset.name;
    if (!settings[name]) settings[name] = { done: false, ignore: false, threshold: '' };
    settings[name].ignore = cb.checked;
  });
  Promise.all([
    t.set('board', 'shared', 'listSettings', settings),
    t.set('board', 'shared', 'language', currentLang)
  ]).then(function() { t.closeModal(); });
});

/* ===================== EXPORT ===================== */

function setExportStatus(text) {
  var el = document.getElementById('export-status');
  if (!el) return;
  if (text) {
    el.innerText = text;
    el.classList.add('visible');
  } else {
    el.classList.remove('visible');
    el.innerText = '';
  }
}

function setExportButtonsDisabled(disabled) {
  var csvBtn  = document.getElementById('export-csv');
  var xlsxBtn = document.getElementById('export-xlsx');
  if (csvBtn)  csvBtn.disabled  = disabled;
  if (xlsxBtn) xlsxBtn.disabled = disabled;
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

function formatDateFull(d) {
  var dt  = new Date(d);
  var y   = dt.getFullYear();
  var m   = String(dt.getMonth() + 1).padStart(2, '0');
  var day = String(dt.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function getCustomFieldRawValue(item) {
  if (!item) return '';
  if (item.value) {
    if (item.value.text !== undefined)    return item.value.text;
    if (item.value.number !== undefined)  return item.value.number;
    if (item.value.checked !== undefined) return item.value.checked;
    if (item.value.date !== undefined)    return item.value.date;
  }
  if (item.idValue) return item.idValue;
  return '';
}

function csvEscape(val) {
  var s = (val === null || val === undefined) ? '' : String(val);
  if (/[",\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function buildExportRows(cards, customFields, listMap) {
  var rows = [];

  cards.forEach(function(card) {
    var listName = listMap[card.idList] || '';
    var setting  = listSettings[listName] || {};
    if (setting.ignore) return; // ignored lists excluded, consistent with panel/badge

    var actions = (card.actions || []).slice().reverse();
    var moveActions  = actions.filter(function(a) { return a.data && a.data.listAfter; });
    var createAction = actions.find(function(a) { return a.type === 'createCard'; });
    var lastMove     = moveActions.length
      ? moveActions[moveActions.length - 1]
      : (createAction || actions[actions.length - 1]);

    var isDone = setting.done || false;
    var currentStageMs = lastMove
      ? ((isDone ? new Date(lastMove.date) : new Date()) - new Date(lastMove.date))
      : 0;
    var cardAgeMs = actions.length ? (Date.now() - new Date(actions[0].date)) : 0;

    var createdBy = '';
    if (createAction && createAction.memberCreator) {
      createdBy = createAction.memberCreator.fullName || createAction.memberCreator.username || '';
    }

    var activityCount = {};
    actions.forEach(function(a) {
      if (a.memberCreator) {
        var name = a.memberCreator.fullName || a.memberCreator.username || '';
        if (name) activityCount[name] = (activityCount[name] || 0) + 1;
      }
    });
    var mostActive = '', mostActiveCount = 0;
    Object.keys(activityCount).forEach(function(name) {
      if (activityCount[name] > mostActiveCount) { mostActive = name; mostActiveCount = activityCount[name]; }
    });

    var row = {
      'Kart Adı':      card.name,
      'Liste':         listName,
      'Current Stage': formatTime(currentStageMs),
      'Card Age':      formatTime(cardAgeMs),
      'Created By':    createdBy,
      'Most Active':   mostActive,
      'Due Date':      card.due ? formatDateFull(card.due) : '',
      'Tamamlandı':    card.dueComplete ? 'Evet' : 'Hayır'
    };

    (customFields || []).forEach(function(cf) {
      var item = (card.customFieldItems || []).find(function(ci) { return ci.idCustomField === cf.id; });
      row[cf.name] = getCustomFieldRawValue(item);
    });

    rows.push(row);
  });

  return rows;
}

function downloadBlob(content, filename, mime) {
  var blob = new Blob([content], { type: mime });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
}

function exportToCsv(rows, filename) {
  var headers = Object.keys(rows[0]);
  var lines = [headers.map(csvEscape).join(',')];
  rows.forEach(function(r) {
    lines.push(headers.map(function(h) { return csvEscape(r[h]); }).join(','));
  });
  // UTF-8 BOM so Excel renders Turkish/accented characters correctly
  downloadBlob('\uFEFF' + lines.join('\r\n'), filename, 'text/csv;charset=utf-8;');
}

function exportToXlsx(rows, filename) {
  var ws = XLSX.utils.json_to_sheet(rows);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ListClock');
  XLSX.writeFile(wb, filename);
}

function runExport(format) {
  if (isExporting) return;
  if (!currentToken || !currentBoardId) {
    setExportStatus(STRINGS[currentLang].connectMsg);
    return;
  }
  isExporting = true;
  setExportButtonsDisabled(true);
  setExportStatus(STRINGS[currentLang].exportFetching);

  var listMap = {};
  boardLists.forEach(function(l) { listMap[l.id] = l.name; });

  var cardsUrl =
    'https://api.trello.com/1/boards/' + currentBoardId + '/cards/open' +
    '?fields=name,idList,due,dueComplete' +
    '&actions=createCard,updateCard:idList&actions_limit=1000' +
    '&action_fields=date,data,type' +
    '&actionMemberCreator=true&actionMemberCreator_fields=fullName,username' +
    '&customFieldItems=true' +
    '&key=' + API_KEY + '&token=' + currentToken;

  var fieldsUrl =
    'https://api.trello.com/1/boards/' + currentBoardId + '/customFields' +
    '?key=' + API_KEY + '&token=' + currentToken;

  Promise.all([
    fetch(fieldsUrl).then(function(r) {
      if (!r.ok) throw new Error('customFields request failed: ' + r.status);
      return r.json();
    }),
    fetch(cardsUrl).then(function(r) {
      if (!r.ok) throw new Error('cards request failed: ' + r.status);
      return r.json();
    })
  ]).then(function(results) {
    var customFields = Array.isArray(results[0]) ? results[0] : [];
    var cards         = Array.isArray(results[1]) ? results[1] : [];

    setExportStatus(STRINGS[currentLang].exportBuilding);
    var rows = buildExportRows(cards, customFields, listMap);

    if (!rows.length) {
      setExportStatus(STRINGS[currentLang].exportEmpty);
      isExporting = false;
      setExportButtonsDisabled(false);
      return;
    }

    var filename = 'ListClock-export-' + formatDateFull(new Date());
    if (format === 'csv') {
      exportToCsv(rows, filename + '.csv');
    } else {
      exportToXlsx(rows, filename + '.xlsx');
    }

    setExportStatus(STRINGS[currentLang].exportDone.replace('{n}', rows.length));
    isExporting = false;
    setExportButtonsDisabled(false);
  }).catch(function(err) {
    console.error('[ListClock] export failed:', err);
    setExportStatus(STRINGS[currentLang].exportError);
    isExporting = false;
    setExportButtonsDisabled(false);
  });
}
