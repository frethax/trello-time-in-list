/* ---- settings.js — Time in List configuration ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';
var t = TrelloPowerUp.iframe({ appKey: API_KEY, appName: 'Time in List' });

var STRINGS = {
  en: {
    langTitle:  'Language',
    listsTitle: 'List Settings',
    flagAfter:  'Flag after',
    days:       'days',
    doneList:   'Done list — freeze timers',
    save:       'Save Settings',
    loading:    'Loading...',
    error:      'Could not load lists. Please reconnect your account.'
  },
  tr: {
    langTitle:  'Dil',
    listsTitle: 'Liste Ayarları',
    flagAfter:  'Uyar',
    days:       'günden sonra',
    doneList:   'Tamamlandı — süreyi dondur',
    save:       'Kaydet',
    loading:    'Yükleniyor...',
    error:      'Listeler yüklenemedi. Lütfen hesabınızı yeniden bağlayın.'
  },
  es: {
    langTitle:  'Idioma',
    listsTitle: 'Configuración de listas',
    flagAfter:  'Marcar tras',
    days:       'días',
    doneList:   'Lista finalizada — congelar tiempo',
    save:       'Guardar',
    loading:    'Cargando...',
    error:      'No se pudieron cargar las listas. Vuelve a conectar tu cuenta.'
  },
  pt: {
    langTitle:  'Idioma',
    listsTitle: 'Configurações de listas',
    flagAfter:  'Sinalizar após',
    days:       'dias',
    doneList:   'Lista concluída — congelar tempo',
    save:       'Salvar',
    loading:    'Carregando...',
    error:      'Não foi possível carregar as listas. Reconecte sua conta.'
  }
};

var LANGS = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' }
];

var currentLang  = 'en';
var boardLists   = [];
var listSettings = {};

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
  var saveBtn = document.getElementById('save');
  if (saveBtn) saveBtn.innerText = s.save;
}

function renderLists() {
  var s = STRINGS[currentLang];
  var container = document.getElementById('lists');
  container.innerHTML = '';

  boardLists.forEach(function(list) {
    var saved = listSettings[list.name] || { done: false, threshold: '' };

    var item = document.createElement('div');
    item.className = 'list-item';

    // List name
    var nameSpan = document.createElement('div');
    nameSpan.className = 'list-name';
    nameSpan.innerText = list.name;
    nameSpan.title = list.name;

    // Row 1: threshold
    var row1 = document.createElement('div');
    row1.className = 'item-row';

    var flagLabel = document.createElement('span');
    flagLabel.className = 'control-label';
    flagLabel.innerText = s.flagAfter;

    var thresholdInput = document.createElement('input');
    thresholdInput.type = 'number';
    thresholdInput.min = '1';
    thresholdInput.max = '999';
    thresholdInput.placeholder = '—';
    thresholdInput.value = saved.threshold || '';
    thresholdInput.dataset.name = list.name;
    thresholdInput.className = 'threshold-input';

    var daysLabel = document.createElement('span');
    daysLabel.className = 'control-label';
    daysLabel.innerText = s.days;

    row1.appendChild(flagLabel);
    row1.appendChild(thresholdInput);
    row1.appendChild(daysLabel);

    // Row 2: done toggle
    var row2 = document.createElement('div');
    row2.className = 'item-row item-row-done';

    var doneLabel = document.createElement('span');
    doneLabel.className = 'control-label';
    doneLabel.innerText = s.doneList;

    var toggleLabel = document.createElement('label');
    toggleLabel.className = 'toggle';

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = saved.done || false;
    checkbox.dataset.name = list.name;
    checkbox.className = 'done-checkbox';

    var slider = document.createElement('span');
    slider.className = 'slider';

    toggleLabel.appendChild(checkbox);
    toggleLabel.appendChild(slider);

    row2.appendChild(doneLabel);
    row2.appendChild(toggleLabel);

    item.appendChild(nameSpan);
    item.appendChild(row1);
    item.appendChild(row2);
    container.appendChild(item);
  });
}

t.render(function() {
  var restApi = t.getRestApi();
  return restApi.getToken().then(function(token) {
    return Promise.all([
      t.board('id'),
      t.get('board', 'shared', 'listSettings'),
      t.get('board', 'shared', 'language')
    ]).then(function(results) {
      var boardId   = results[0].id;
      listSettings  = results[1] || {};
      var savedLang = results[2] || 'en';

      currentLang = savedLang;
      LANGS.forEach(function(l) {
        var btn = document.getElementById('lang-' + l.code);
        if (btn) btn.className = 'lang-btn' + (l.code === savedLang ? ' active' : '');
      });
      applyStrings();

      return fetch(
        'https://api.trello.com/1/boards/' + boardId +
        '/lists?key=' + API_KEY + '&token=' + token
      )
      .then(function(r) { return r.json(); })
      .then(function(lists) {
        boardLists = lists;
        renderLists();
        document.getElementById('save').style.display = 'block';
        applyStrings();
      });
    });
  }).catch(function() {
    document.getElementById('lists').innerHTML =
      '<div class="loading">' + STRINGS[currentLang].error + '</div>';
  });
});

document.getElementById('save').addEventListener('click', function() {
  var settings = {};

  document.querySelectorAll('.threshold-input').forEach(function(input) {
    var name = input.dataset.name;
    if (!settings[name]) settings[name] = { done: false, threshold: '' };
    settings[name].threshold = input.value ? parseInt(input.value) : '';
  });

  document.querySelectorAll('.done-checkbox').forEach(function(cb) {
    var name = cb.dataset.name;
    if (!settings[name]) settings[name] = { done: false, threshold: '' };
    settings[name].done = cb.checked;
  });

  Promise.all([
    t.set('board', 'shared', 'listSettings', settings),
    t.set('board', 'shared', 'language', currentLang)
  ]).then(function() {
    t.closePopup();
  });
});
