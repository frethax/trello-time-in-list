/* ---- settings.js — Time in List configuration ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';
var t = TrelloPowerUp.iframe({ appKey: API_KEY, appName: 'Time in List' });

var STRINGS = {
  en: { langTitle:'Language', listsTitle:'List Settings', days:'days', doneLabel:'✓ Done', save:'Save Settings', loading:'Loading...', error:'Could not load lists. Please reconnect your account.' },
  tr: { langTitle:'Dil', listsTitle:'Liste Ayarları', days:'gün', doneLabel:'✓ Tamamlandı', save:'Kaydet', loading:'Yükleniyor...', error:'Listeler yüklenemedi. Lütfen hesabınızı yeniden bağlayın.' },
  es: { langTitle:'Idioma', listsTitle:'Configuración de listas', days:'días', doneLabel:'✓ Hecho', save:'Guardar', loading:'Cargando...', error:'No se pudieron cargar las listas.' },
  pt: { langTitle:'Idioma', listsTitle:'Configurações de listas', days:'dias', doneLabel:'✓ Concluído', save:'Salvar', loading:'Carregando...', error:'Não foi possível carregar as listas.' }
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
    if (btn) {
      btn.addEventListener('click', function() { setLang(l.code); });
    }
  });
});

var currentLang = 'en', boardLists = [], listSettings = {};

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

function updatePill(input) {
  var pill = input.closest ? input.closest('.flag-pill') : input.parentNode;
  if (input.value && parseInt(input.value) > 0) {
    pill.className = 'flag-pill active';
  } else {
    pill.className = 'flag-pill';
  }
}

function renderLists() {
  var s = STRINGS[currentLang];
  var container = document.getElementById('lists');
  container.innerHTML = '';

  boardLists.forEach(function(list) {
    var saved = listSettings[list.name] || { done: false, threshold: '' };

    var item = document.createElement('div');
    item.className = 'list-item';

    var nameSpan = document.createElement('span');
    nameSpan.className = 'list-name';
    nameSpan.innerText = list.name;
    nameSpan.title = list.name;

    var controls = document.createElement('div');
    controls.className = 'item-controls';

    // Flag pill
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

    // Separator
    var sep = document.createElement('div');
    sep.className = 'separator';

    // Done label
    var doneLbl = document.createElement('span');
    doneLbl.className = 'control-label';
    doneLbl.innerText = s.doneLabel;

    // Toggle
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

    controls.appendChild(pill);
    controls.appendChild(sep);
    controls.appendChild(doneLbl);
    controls.appendChild(toggleLabel);

    item.appendChild(nameSpan);
    item.appendChild(controls);
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
      var boardId = results[0].id;
      listSettings = results[1] || {};
      var savedLang = results[2] || 'en';
      currentLang = savedLang;
      LANGS.forEach(function(l) {
        var btn = document.getElementById('lang-' + l.code);
        if (btn) btn.className = 'lang-btn' + (l.code === savedLang ? ' active' : '');
      });
      applyStrings();
      return fetch('https://api.trello.com/1/boards/' + boardId + '/lists?key=' + API_KEY + '&token=' + token)
        .then(function(r) { return r.json(); })
        .then(function(lists) {
          boardLists = lists;
          renderLists();
          document.getElementById('save').style.display = 'block';
          applyStrings();
        });
    });
  }).catch(function() {
    document.getElementById('lists').innerHTML = '<div class="loading">' + STRINGS[currentLang].error + '</div>';
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
}).then(function() { t.closeModal(); });
