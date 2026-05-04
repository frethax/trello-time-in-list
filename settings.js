/* ---- settings.js — Time in List configuration ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';
var t = TrelloPowerUp.iframe({ appKey: API_KEY, appName: 'Time in List' });

t.render(function() {
  var restApi = t.getRestApi();
  return restApi.getToken().then(function(token) {
    return Promise.all([
      t.board('id'),
      t.get('board', 'shared', 'listSettings')
    ]).then(function(results) {
      var boardId      = results[0].id;
      var listSettings = results[1] || {};

      return fetch(
        'https://api.trello.com/1/boards/' + boardId +
        '/lists?key=' + API_KEY + '&token=' + token
      )
      .then(function(r) { return r.json(); })
      .then(function(lists) {
        var container = document.getElementById('lists');
        container.innerHTML = '';

        lists.forEach(function(list) {
          var saved = listSettings[list.name] || { done: false, threshold: '' };

          var item = document.createElement('div');
          item.className = 'list-item';

          // List name
          var nameSpan = document.createElement('span');
          nameSpan.className = 'list-name';
          nameSpan.innerText = list.name;

          // Controls
          var controls = document.createElement('div');
          controls.style.cssText = 'display:flex;align-items:center;gap:10px;flex-shrink:0';

          // Threshold input
          var thresholdWrap = document.createElement('div');
          thresholdWrap.style.cssText = 'display:flex;align-items:center;gap:4px';

          var thresholdInput = document.createElement('input');
          thresholdInput.type = 'number';
          thresholdInput.min = '1';
          thresholdInput.max = '999';
          thresholdInput.placeholder = '—';
          thresholdInput.value = saved.threshold || '';
          thresholdInput.dataset.name = list.name;
          thresholdInput.className = 'threshold-input';
          thresholdInput.style.cssText = 'width:48px;padding:4px 6px;border:1px solid #dfe1e6;border-radius:4px;font-size:12px;text-align:center;color:#172b4d';

          var thresholdLabel = document.createElement('span');
          thresholdLabel.style.cssText = 'font-size:11px;color:#5e6c84;white-space:nowrap';
          thresholdLabel.innerText = 'days';

          thresholdWrap.appendChild(thresholdInput);
          thresholdWrap.appendChild(thresholdLabel);

          // Done toggle
          var doneWrap = document.createElement('div');
          doneWrap.style.cssText = 'display:flex;align-items:center;gap:4px';

          var doneLabel = document.createElement('span');
          doneLabel.style.cssText = 'font-size:11px;color:#5e6c84;white-space:nowrap';
          doneLabel.innerText = 'Done';

          var toggleLabel = document.createElement('label');
          toggleLabel.className = 'toggle';

          var input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = saved.done || false;
          input.dataset.name = list.name;
          input.className = 'done-checkbox';

          var slider = document.createElement('span');
          slider.className = 'slider';

          toggleLabel.appendChild(input);
          toggleLabel.appendChild(slider);

          doneWrap.appendChild(doneLabel);
          doneWrap.appendChild(toggleLabel);

          controls.appendChild(thresholdWrap);
          controls.appendChild(doneWrap);

          item.appendChild(nameSpan);
          item.appendChild(controls);
          container.appendChild(item);
        });

        document.getElementById('save').style.display = 'block';
      });
    });
  }).catch(function() {
    document.getElementById('lists').innerHTML =
      '<div class="loading">Could not load lists. Please reconnect your account.</div>';
  });
});

document.getElementById('save').addEventListener('click', function() {
  var settings = {};

  var thresholdInputs = document.querySelectorAll('.threshold-input');
  var doneCheckboxes  = document.querySelectorAll('.done-checkbox');

  thresholdInputs.forEach(function(input) {
    var name = input.dataset.name;
    if (!settings[name]) settings[name] = { done: false, threshold: '' };
    settings[name].threshold = input.value ? parseInt(input.value) : '';
  });

  doneCheckboxes.forEach(function(cb) {
    var name = cb.dataset.name;
    if (!settings[name]) settings[name] = { done: false, threshold: '' };
    settings[name].done = cb.checked;
  });

  t.set('board', 'shared', 'listSettings', settings).then(function() {
    t.closePopup();
  });
});
