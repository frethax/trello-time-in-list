/* ---- settings.js — Kanbrain configuration ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';
var t = TrelloPowerUp.iframe({ appKey: API_KEY, appName: 'Kanbrain' });

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
    helpIgnore:  '⊘ Ignore — Cards in this list are hidden from the Kanbrain panel and badge.',
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
    connectBtn:     'Connect Trello Account',
    retryBtn:       'Try Again',
    numTitle: "Card Numbers",
    numEnable: "Enable card numbers",
    numEnableSub: "Shown as a badge and written into each card description",
    numPrefix: "Prefix",
    numPreview: "Example: {x}",
    numPos: "Position in description",
    numTop: "Top",
    numBottom: "Bottom",
    numApply: "Number all cards",
    numRemove: "Remove all numbers",
    numConfirm: "Click again to confirm",
    numHelp: "The number is added to the card description so Trello search can find it (search \"{x}\"). New cards are numbered automatically when they appear on the board.",
    numWorking: "Updating cards... ({d}/{n})",
    numDone: "{n} cards numbered.",
    numUpToDate: "All cards are already up to date.",
    numRemoved: "Numbers removed from {n} cards.",
    numAuthNeeded: "Write permission is needed to add numbers to card descriptions.",
    numError: "Could not update cards. Please try again.",
    numColor: "Badge color",
    numGrant: "Grant write access",
    numAuthFailed: "Authorization was cancelled or blocked. Please allow pop-ups and try again.",
    numFailed: "{ok} cards updated, {f} failed (code {code})."
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
    helpIgnore:  '⊘ Yoksay — Bu listedeki kartlar Kanbrain panelinde ve badge\'de gösterilmez.',
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
    connectBtn:     'Trello Hesabını Bağla',
    retryBtn:       'Tekrar Dene',
    numTitle: "Kart Numaraları",
    numEnable: "Kart numaralandırmayı aç",
    numEnableSub: "Badge olarak gösterilir ve her kartın açıklamasına yazılır",
    numPrefix: "Önek",
    numPreview: "Örnek: {x}",
    numPos: "Açıklamadaki konum",
    numTop: "Üst",
    numBottom: "Alt",
    numApply: "Tüm kartları numaralandır",
    numRemove: "Tüm numaraları kaldır",
    numConfirm: "Onaylamak için tekrar tıklayın",
    numHelp: "Numara kart açıklamasına eklenir, böylece Trello aramasıyla bulunabilir (\"{x}\" diye arayın). Yeni kartlar board’da göründüğünde otomatik numaralanır.",
    numWorking: "Kartlar güncelleniyor... ({d}/{n})",
    numDone: "{n} kart numaralandırıldı.",
    numUpToDate: "Tüm kartlar zaten güncel.",
    numRemoved: "{n} karttan numara kaldırıldı.",
    numAuthNeeded: "Açıklamalara numara eklemek için yazma izni gerekiyor.",
    numError: "Kartlar güncellenemedi. Lütfen tekrar deneyin.",
    numColor: "Badge rengi",
    numGrant: "Yazma izni ver",
    numAuthFailed: "Yetkilendirme iptal edildi veya engellendi. Açılır pencerelere izin verip tekrar deneyin.",
    numFailed: "{ok} kart güncellendi, {f} kart güncellenemedi (kod {code})."
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
    helpIgnore:  '⊘ Ignorar — Las tarjetas en esta lista se ocultan del panel y la insignia de Kanbrain.',
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
    connectBtn:     'Conectar Cuenta de Trello',
    retryBtn:       'Reintentar',
    numTitle: "Números de tarjeta",
    numEnable: "Activar números de tarjeta",
    numEnableSub: "Se muestra como insignia y se escribe en la descripción",
    numPrefix: "Prefijo",
    numPreview: "Ejemplo: {x}",
    numPos: "Posición en la descripción",
    numTop: "Arriba",
    numBottom: "Abajo",
    numApply: "Numerar todas",
    numRemove: "Quitar números",
    numConfirm: "Haz clic de nuevo para confirmar",
    numHelp: "El número se añade a la descripción para que la búsqueda de Trello lo encuentre (busca \"{x}\"). Las tarjetas nuevas se numeran automáticamente al aparecer en el tablero.",
    numWorking: "Actualizando tarjetas... ({d}/{n})",
    numDone: "{n} tarjetas numeradas.",
    numUpToDate: "Todas las tarjetas ya están al día.",
    numRemoved: "Números quitados de {n} tarjetas.",
    numAuthNeeded: "Se necesita permiso de escritura para añadir números a las descripciones.",
    numError: "No se pudieron actualizar las tarjetas. Inténtalo de nuevo.",
    numColor: "Color de insignia",
    numGrant: "Conceder permiso de escritura",
    numAuthFailed: "La autorización se canceló o se bloqueó. Permite las ventanas emergentes e inténtalo de nuevo.",
    numFailed: "{ok} tarjetas actualizadas, {f} fallaron (código {code})."
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
    helpIgnore:  '⊘ Ignorar — Os cartões nesta lista ficam ocultos do painel e do badge do Kanbrain.',
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
    connectBtn:     'Conectar Conta Trello',
    retryBtn:       'Tentar Novamente',
    numTitle: "Números de cartão",
    numEnable: "Ativar números de cartão",
    numEnableSub: "Exibido como badge e escrito na descrição de cada cartão",
    numPrefix: "Prefixo",
    numPreview: "Exemplo: {x}",
    numPos: "Posição na descrição",
    numTop: "Topo",
    numBottom: "Final",
    numApply: "Numerar todos",
    numRemove: "Remover números",
    numConfirm: "Clique novamente para confirmar",
    numHelp: "O número é adicionado à descrição para que a busca do Trello o encontre (busque \"{x}\"). Cartões novos são numerados automaticamente ao aparecer no quadro.",
    numWorking: "Atualizando cartões... ({d}/{n})",
    numDone: "{n} cartões numerados.",
    numUpToDate: "Todos os cartões já estão atualizados.",
    numRemoved: "Números removidos de {n} cartões.",
    numAuthNeeded: "É necessária permissão de escrita para adicionar números às descrições.",
    numError: "Não foi possível atualizar os cartões. Tente novamente.",
    numColor: "Cor do badge",
    numGrant: "Conceder permissão de escrita",
    numAuthFailed: "A autorização foi cancelada ou bloqueada. Permita pop-ups e tente novamente.",
    numFailed: "{ok} cartões atualizados, {f} falharam (código {code})."
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
  bindNumberingControls();
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
  applyNumberingStrings();
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

// Fetch the board lists with a few automatic retries, so a transient
// network blip or a momentary Trello hiccup (429/500) doesn't leave the
// panel stuck on the error message.
function fetchListsWithRetry(boardId, token, attempt) {
  attempt = attempt || 0;
  var url = 'https://api.trello.com/1/boards/' + boardId +
            '/lists?key=' + API_KEY + '&token=' + token;
  return fetch(url).then(function(r) {
    if (r.ok) return r.json();
    if (r.status === 401) return { __reconnect: true };   // stale token
    // Retry transient failures (429 rate limit, 5xx) up to 3 times
    if ((r.status === 429 || r.status >= 500) && attempt < 3) {
      return new Promise(function(res) { setTimeout(res, 500 * (attempt + 1)); })
        .then(function() { return fetchListsWithRetry(boardId, token, attempt + 1); });
    }
    throw new Error('Lists request failed with status ' + r.status);
  }).catch(function(err) {
    // Network-level failure (no response at all) — retry too
    if (attempt < 3) {
      return new Promise(function(res) { setTimeout(res, 500 * (attempt + 1)); })
        .then(function() { return fetchListsWithRetry(boardId, token, attempt + 1); });
    }
    throw err;
  });
}

t.render(function() {
  var restApi = t.getRestApi();
  loadNumbering();
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
      return fetchListsWithRetry(boardId, token)
      .then(function(lists) {
        if (lists && lists.__reconnect) { showConnectGate(); return; }
        boardLists = lists;
        renderLists();
        document.getElementById('save').style.display = 'block';
        applyStrings();
      });
    });
  }).catch(function(err) {
    console.error('[Kanbrain] settings load failed:', err);
    var container = document.getElementById('lists');
    container.innerHTML = '';
    var msg = document.createElement('div');
    msg.className = 'loading';
    msg.innerText = STRINGS[currentLang].error;
    var retry = document.createElement('button');
    retry.className = 'save-btn';
    retry.style.marginTop = '10px';
    retry.innerText = STRINGS[currentLang].retryBtn;
    retry.addEventListener('click', function() { t.render(function() {}); });
    container.appendChild(msg);
    container.appendChild(retry);
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

function buildExportRows(cards, customFields, listMap, actionsByCard) {
  var rows = [];

  cards.forEach(function(card) {
    // Prefer the list name embedded on the card; fall back to listMap.
    var listName = (card.list && card.list.name) ? card.list.name : (listMap[card.idList] || '');
    var setting  = listSettings[listName] || {};
    if (setting.ignore) return; // ignored lists excluded, consistent with panel/badge

    var raw = actionsByCard[card.id] || [];
    // actions come newest-first from API; reverse to oldest-first
    var actions = raw.slice().reverse();
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
      'Card Name':     card.name,
      'List':          listName,
      'Current Stage': formatTime(currentStageMs),
      'Card Age':      formatTime(cardAgeMs),
      'Created By':    createdBy,
      'Most Active':   mostActive,
      'Due Date':      card.due ? formatDateFull(card.due) : '',
      'Completed':     card.dueComplete ? 'Yes' : 'No'
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

/* ---- Minimal dependency-free XLSX writer ----
   An .xlsx file is a ZIP archive of XML parts. We build the required parts
   as strings and pack them with a tiny store-only (no compression) ZIP writer.
   No external library, no CDN, no CSP concerns. */

function xlsxColLetter(n) {
  // 0-based column index -> A, B, ... Z, AA, AB, ...
  var s = '';
  n = n + 1;
  while (n > 0) {
    var rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function xlsxEsc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function buildSheetXml(rows) {
  var headers = Object.keys(rows[0]);
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  xml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';

  // Header row
  xml += '<row r="1">';
  headers.forEach(function(h, c) {
    var ref = xlsxColLetter(c) + '1';
    xml += '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + xlsxEsc(h) + '</t></is></c>';
  });
  xml += '</row>';

  // Data rows
  rows.forEach(function(row, ri) {
    var r = ri + 2;
    xml += '<row r="' + r + '">';
    headers.forEach(function(h, c) {
      var val = row[h];
      var ref = xlsxColLetter(c) + r;
      if (typeof val === 'number' && isFinite(val)) {
        xml += '<c r="' + ref + '"><v>' + val + '</v></c>';
      } else {
        var text = (val === null || val === undefined) ? '' : String(val);
        xml += '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + xlsxEsc(text) + '</t></is></c>';
      }
    });
    xml += '</row>';
  });

  xml += '</sheetData></worksheet>';
  return xml;
}

/* --- CRC32 (for ZIP) --- */
var _crcTable = (function() {
  var table = [];
  for (var n = 0; n < 256; n++) {
    var c = n;
    for (var k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ _crcTable[(crc ^ bytes[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function strToUtf8Bytes(str) {
  return new TextEncoder().encode(str);
}

/* --- Store-only ZIP writer --- */
function zipStore(files) {
  // files: [{ name, bytes }]
  var chunks = [];
  var central = [];
  var offset = 0;

  function u16(n) { return [n & 0xFF, (n >>> 8) & 0xFF]; }
  function u32(n) { return [n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF]; }

  files.forEach(function(f) {
    var nameBytes = strToUtf8Bytes(f.name);
    var crc = crc32(f.bytes);
    var size = f.bytes.length;

    // Local file header
    var local = []
      .concat(u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
              u32(crc), u32(size), u32(size), u16(nameBytes.length), u16(0));
    chunks.push(new Uint8Array(local));
    chunks.push(nameBytes);
    chunks.push(f.bytes);

    // Central directory record
    var cd = []
      .concat(u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
              u32(crc), u32(size), u32(size), u16(nameBytes.length),
              u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset));
    central.push(new Uint8Array(cd));
    central.push(nameBytes);

    offset += local.length + nameBytes.length + size;
  });

  var centralStart = offset;
  var centralSize = 0;
  central.forEach(function(c) { centralSize += c.length; });

  var end = []
    .concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
            u32(centralSize), u32(centralStart), u16(0));

  var all = chunks.concat(central).concat([new Uint8Array(end)]);
  var total = 0;
  all.forEach(function(a) { total += a.length; });
  var out = new Uint8Array(total);
  var p = 0;
  all.forEach(function(a) { out.set(a, p); p += a.length; });
  return out;
}

function exportToXlsx(rows, filename) {
  var contentTypes =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '</Types>';

  var rootRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>';

  var workbook =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheets><sheet name="Kanbrain" sheetId="1" r:id="rId1"/></sheets></workbook>';

  var workbookRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '</Relationships>';

  var sheet = buildSheetXml(rows);

  var files = [
    { name: '[Content_Types].xml',        bytes: strToUtf8Bytes(contentTypes) },
    { name: '_rels/.rels',                bytes: strToUtf8Bytes(rootRels) },
    { name: 'xl/workbook.xml',            bytes: strToUtf8Bytes(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', bytes: strToUtf8Bytes(workbookRels) },
    { name: 'xl/worksheets/sheet1.xml',   bytes: strToUtf8Bytes(sheet) }
  ];

  var zipped = zipStore(files);
  downloadBlob(
    zipped,
    filename,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

// Fetch that resolves to null on any failure instead of rejecting —
// lets non-critical requests (custom fields, a single card's actions) fail
// without aborting the whole export.
function safeFetchJson(url) {
  return fetch(url)
    .then(function(r) { return r.ok ? r.json() : null; })
    .catch(function() { return null; });
}

// Run an array of task functions (each returns a Promise) in small batches
// to stay well under Trello's rate limit (100 req / 10s per token).
function runInBatches(items, batchSize, delayMs, worker) {
  var i = 0;
  function nextBatch() {
    if (i >= items.length) return Promise.resolve();
    var slice = items.slice(i, i + batchSize);
    i += batchSize;
    return Promise.all(slice.map(worker)).then(function() {
      if (i >= items.length) return;
      return new Promise(function(res) { setTimeout(res, delayMs); }).then(nextBatch);
    });
  }
  return nextBatch();
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

  // 1) Cards — ask Trello to embed each card's list object, so we get the
  //    list name directly and don't depend on boardLists being complete
  //    (which misses archived lists and can be stale).
  var cardsUrl =
    'https://api.trello.com/1/boards/' + currentBoardId + '/cards/open' +
    '?fields=name,idList,due,dueComplete' +
    '&list=true&list_fields=name' +
    '&customFieldItems=true' +
    '&key=' + API_KEY + '&token=' + currentToken;

  // 2) Custom field definitions — independent; failure just means empty columns.
  var fieldsUrl =
    'https://api.trello.com/1/boards/' + currentBoardId + '/customFields' +
    '?key=' + API_KEY + '&token=' + currentToken;

  Promise.all([
    safeFetchJson(cardsUrl),
    safeFetchJson(fieldsUrl)
  ]).then(function(results) {
    var cards        = Array.isArray(results[0]) ? results[0] : [];
    var customFields = Array.isArray(results[1]) ? results[1] : [];

    if (!cards.length) {
      // Cards request itself failed or board truly empty
      setExportStatus(STRINGS[currentLang].exportEmpty);
      isExporting = false;
      setExportButtonsDisabled(false);
      return;
    }

    // Only need actions for cards we'll actually export (skip ignored lists)
    var exportCards = cards.filter(function(card) {
      var ln = (card.list && card.list.name) ? card.list.name : (listMap[card.idList] || '');
      var setting = listSettings[ln] || {};
      return !setting.ignore;
    });

    // 3) Per-card actions — same proven approach as the card panel.
    //    Each fetch is independent; one failing leaves that card's timers blank
    //    but never breaks the export.
    var actionsByCard = {};
    var doneCount = 0;
    return runInBatches(exportCards, 8, 350, function(card) {
      var url =
        'https://api.trello.com/1/cards/' + card.id +
        '/actions?filter=updateCard:idList,createCard' +
        '&memberCreator=true&memberCreator_fields=fullName,username' +
        '&limit=1000&key=' + API_KEY + '&token=' + currentToken;
      return safeFetchJson(url).then(function(actions) {
        actionsByCard[card.id] = Array.isArray(actions) ? actions : [];
        doneCount++;
        setExportStatus(STRINGS[currentLang].exportFetching + ' (' + doneCount + '/' + exportCards.length + ')');
      });
    }).then(function() {
      setExportStatus(STRINGS[currentLang].exportBuilding);
      var rows = buildExportRows(cards, customFields, listMap, actionsByCard);

      if (!rows.length) {
        setExportStatus(STRINGS[currentLang].exportEmpty);
        isExporting = false;
        setExportButtonsDisabled(false);
        return;
      }

      var filename = 'Kanbrain-export-' + formatDateFull(new Date());
      if (format === 'csv') {
        exportToCsv(rows, filename + '.csv');
      } else {
        exportToXlsx(rows, filename + '.xlsx');
      }

      setExportStatus(STRINGS[currentLang].exportDone.replace('{n}', rows.length));
      isExporting = false;
      setExportButtonsDisabled(false);
    });
  }).catch(function(err) {
    console.error('[Kanbrain] export failed:', err);
    setExportStatus(STRINGS[currentLang].exportError);
    isExporting = false;
    setExportButtonsDisabled(false);
  });
}

/* ===================== CARD NUMBERING ===================== */

var numberingCfg = kbNormalizeNumbering(null);
var isNumbering = false;
var removeConfirmTimer = null;

function numStr(key, vars) {
  var s = STRINGS[currentLang][key] || STRINGS.en[key] || '';
  vars = vars || {};
  return s.replace(/\{(\w+)\}/g, function(_, k) { return vars[k] != null ? vars[k] : ''; });
}

function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.innerText = text;
}

function livePrefix() {
  var el = document.getElementById('num-prefix');
  return el && document.activeElement === el ? el.value : numberingCfg.prefix;
}

function renderPreview() {
  var example = kbNumberLabel(livePrefix(), 42);
  var el = document.getElementById('num-preview');
  if (el) {
    el.textContent = numStr('numPreview', { x: '' }).replace(/\s*$/, '');
    var pill = document.createElement('span');
    pill.className = 'num-pill';
    pill.style.backgroundColor = kbColorHex(numberingCfg.color);
    pill.textContent = example;
    el.appendChild(pill);
  }
  setText('num-help', numStr('numHelp', { x: kbSearchToken(example) }));
}

function renderSwatches() {
  var box = document.getElementById('num-swatches');
  if (!box) return;
  box.innerHTML = '';
  KB_BADGE_COLORS.forEach(function(c) {
    var b = document.createElement('button');
    b.className = 'swatch' + (numberingCfg.color === c.id ? ' active' : '');
    b.style.backgroundColor = c.hex;
    b.title = c.id;
    b.setAttribute('aria-label', c.id);
    b.addEventListener('click', function() {
      numberingCfg.color = c.id;
      saveNumbering();
      renderNumbering();
    });
    box.appendChild(b);
  });
}

function applyNumberingStrings() {
  setText('num-title', numStr('numTitle'));
  setText('num-enable-label', numStr('numEnable'));
  setText('num-enable-sub', numStr('numEnableSub'));
  setText('num-prefix-label', numStr('numPrefix'));
  setText('num-color-label', numStr('numColor'));
  setText('num-pos-label', numStr('numPos'));
  setText('num-pos-top', numStr('numTop'));
  setText('num-pos-bottom', numStr('numBottom'));
  setText('num-apply', numStr('numApply'));
  setText('num-grant', numStr('numGrant'));
  if (!removeConfirmTimer) setText('num-remove', numStr('numRemove'));
  renderPreview();
}

function renderNumbering() {
  var cb = document.getElementById('num-enabled');
  var prefix = document.getElementById('num-prefix');
  var opts = document.getElementById('num-options');
  if (cb) cb.checked = numberingCfg.enabled;
  if (prefix && document.activeElement !== prefix) prefix.value = numberingCfg.prefix;
  if (opts) opts.className = numberingCfg.enabled ? '' : 'num-disabled';
  var applyBtn = document.getElementById('num-apply');
  if (applyBtn) applyBtn.disabled = isNumbering || !numberingCfg.enabled;
  ['top', 'bottom'].forEach(function(pos) {
    var b = document.getElementById('num-pos-' + pos);
    if (b) b.className = 'lang-btn pos-btn' + (numberingCfg.position === pos ? ' active' : '');
  });
  renderSwatches();
  applyNumberingStrings();
}

function setNumStatus(text) {
  var el = document.getElementById('num-status');
  if (!el) return;
  if (text) { el.innerText = text; el.classList.add('visible'); }
  else { el.classList.remove('visible'); el.innerText = ''; }
}

function setNumButtonsDisabled(disabled) {
  ['num-apply', 'num-remove', 'num-enabled'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.disabled = disabled;
  });
}

function saveNumbering() {
  return t.set('board', 'shared', 'numbering', numberingCfg);
}

function loadNumbering() {
  t.get('board', 'shared', 'numbering').then(function(cfg) {
    numberingCfg = kbNormalizeNumbering(cfg);
    renderNumbering();
  });
}

// Returns the current token; only asks for authorization when the user has
// never connected. Whether that token can *write* is discovered by the
// first write itself (401) — see runNumbering / showGrantButton.
function ensureWriteToken() {
  var restApi = t.getRestApi();
  return restApi.getToken().then(function(token) {
    if (token) return token;
    return restApi.authorize({ scope: 'read,write', expiration: 'never' })
      .then(function() { return restApi.getToken(); });
  }).then(function(token) {
    if (token) currentToken = token;
    return token || null;
  }).catch(function(err) {
    console.error('[Kanbrain] authorize failed:', err);
    return null;
  });
}

function showGrantButton(show) {
  var b = document.getElementById('num-grant');
  if (b) b.style.display = show ? 'block' : 'none';
}

// Explicit re-authorization with write scope. Called directly from a click
// so the Trello consent pop-up is never blocked.
function grantWriteAccess() {
  var restApi = t.getRestApi();
  restApi.authorize({ scope: 'read,write', expiration: 'never' })
    .then(function() { return restApi.getToken(); })
    .then(function(token) {
      if (!token) throw new Error('no token');
      currentToken = token;
      showGrantButton(false);
      return saveNumbering().then(function() { return runNumbering('apply', token); });
    })
    .catch(function(err) {
      console.error('[Kanbrain] write authorization failed:', err);
      setNumStatus(numStr('numAuthFailed'));
    });
}

function bindNumberingControls() {
  var cb = document.getElementById('num-enabled');
  var prefix = document.getElementById('num-prefix');
  var applyBtn = document.getElementById('num-apply');
  var removeBtn = document.getElementById('num-remove');
  var grantBtn = document.getElementById('num-grant');
  if (grantBtn) grantBtn.addEventListener('click', grantWriteAccess);

  if (cb) cb.addEventListener('change', function() {
    if (!cb.checked) {
      numberingCfg.enabled = false;
      saveNumbering();
      renderNumbering();
      return;
    }
    ensureWriteToken().then(function(token) {
      if (!token) {
        cb.checked = false;
        setNumStatus(numStr('numAuthNeeded'));
        return;
      }
      numberingCfg.enabled = true;
      renderNumbering();
      return saveNumbering().then(function() { return runNumbering('apply', token); });
    });
  });

  if (prefix) {
    prefix.addEventListener('input', renderPreview);
    prefix.addEventListener('change', function() {
      numberingCfg.prefix = kbSanitizePrefix(prefix.value);
      prefix.value = numberingCfg.prefix;
      saveNumbering();
      renderNumbering();
    });
  }

  ['top', 'bottom'].forEach(function(pos) {
    var b = document.getElementById('num-pos-' + pos);
    if (b) b.addEventListener('click', function() {
      numberingCfg.position = pos;
      saveNumbering();
      renderNumbering();
    });
  });

  if (applyBtn) applyBtn.addEventListener('click', function() {
    ensureWriteToken().then(function(token) {
      if (!token) { setNumStatus(numStr('numAuthNeeded')); return; }
      return saveNumbering().then(function() { return runNumbering('apply', token); });
    });
  });

  // Two-step confirm instead of window.confirm(), which can be blocked
  // inside Trello's sandboxed modal iframe.
  if (removeBtn) removeBtn.addEventListener('click', function() {
    if (!removeConfirmTimer) {
      removeBtn.classList.add('confirm');
      removeBtn.innerText = numStr('numConfirm');
      removeConfirmTimer = setTimeout(resetRemoveBtn, 4000);
      return;
    }
    resetRemoveBtn();
    ensureWriteToken().then(function(token) {
      if (!token) { setNumStatus(numStr('numAuthNeeded')); return; }
      // Disable first so the connector doesn't re-add blocks mid-removal.
      numberingCfg.enabled = false;
      renderNumbering();
      return saveNumbering().then(function() { return runNumbering('remove', token); });
    });
  });
}

function resetRemoveBtn() {
  clearTimeout(removeConfirmTimer);
  removeConfirmTimer = null;
  var b = document.getElementById('num-remove');
  if (b) { b.classList.remove('confirm'); b.innerText = numStr('numRemove'); }
}


// mode: 'apply' (add/fix numbers) or 'remove' (strip all number blocks)
function runNumbering(mode, token) {
  if (isNumbering) return Promise.resolve();
  var boardPromise = currentBoardId ? Promise.resolve({ id: currentBoardId }) : t.board('id');
  isNumbering = true;
  setNumButtonsDisabled(true);
  setNumStatus(numStr('numWorking', { d: 0, n: '…' }));

  // Use the *saved* board language (the one the badge connector uses), not
  // an unsaved selection in this modal — otherwise the two would keep
  // rewriting each other's notes.
  var noteLang = 'en';
  return t.get('board', 'shared', 'language').then(function(l) {
    noteLang = l || 'en';
    return boardPromise;
  }).then(function(board) {
    currentBoardId = board.id;
    return fetch('https://api.trello.com/1/boards/' + board.id +
                 '/cards/open?fields=desc,idShort&key=' + API_KEY + '&token=' + token)
      .then(function(r) { if (!r.ok) throw new Error('cards ' + r.status); return r.json(); });
  }).then(function(cards) {
    var cfg = numberingCfg;
    var todo = cards.filter(function(c) {
      if (mode === 'remove') return kbHasNumber(c.desc);
      return !kbHasCorrectNumber(c.desc, kbNumberLabel(cfg.prefix, c.idShort), cfg.position, noteLang);
    });
    if (!todo.length) {
      setNumStatus(mode === 'remove' ? numStr('numRemoved', { n: 0 }) : numStr('numUpToDate'));
      return;
    }
    var done = 0, ok = 0, failed = 0, lastStatus = 0, lastMsg = '', denied = false;
    // One write at a time with a gap: the board's own badge requests share
    // the same rate limit, so bulk writes must leave plenty of headroom.
    return runInBatches(todo, 1, 400, function(c) {
      var desc = mode === 'remove'
        ? kbRemoveNumber(c.desc)
        : kbApplyNumber(c.desc, kbNumberLabel(cfg.prefix, c.idShort), cfg.position, noteLang);
      if (denied) return Promise.resolve();  // stop hammering after a 401
      if (desc.length > 16384) { done++; return Promise.resolve(); }
      return kbPutDesc(API_KEY, token, c.id, desc).then(function(res) {
        done++;
        if (res.ok) ok++; else { failed++; lastStatus = res.status; lastMsg = res.message || ''; }
        if (res.status === 401) denied = true;
        setNumStatus(numStr('numWorking', { d: done, n: todo.length }));
      });
    }).then(function() {
      if (denied) {
        setNumStatus(numStr('numAuthNeeded') + (lastMsg ? ' (401: ' + lastMsg + ')' : ''));
        showGrantButton(true);
      } else if (failed) {
        setNumStatus(numStr('numFailed', { ok: ok, f: failed, code: lastStatus + (lastMsg ? ': ' + lastMsg : '') }));
      } else {
        setNumStatus(mode === 'remove' ? numStr('numRemoved', { n: ok }) : numStr('numDone', { n: ok }));
      }
    });
  }).catch(function(err) {
    console.error('[Kanbrain] numbering failed:', err);
    setNumStatus(numStr('numError'));
  }).then(function() {
    isNumbering = false;
    setNumButtonsDisabled(false);
    renderNumbering();
  });
}
