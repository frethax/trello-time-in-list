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

          // Row 1: list name
          var nameRow = document.createElement('div');
          nameRow.className = 'name-row';

          var nameSpan = document.createElement('span');
          nameSpan.className = 'list-name';
          nameSpan.innerText = list.name;
          nameSpan.title = list.name;

          nameRow.appendChild(nameSpan);

          // Row 2: controls
          var controlRow = document.createElement('div');
          controlRow.className = 'control-row';

          // Threshold
          var thresholdWrap = document.createElement('div');
          thresholdWrap.className = 'threshold-wrap';

          var thresholdLabel = document.createElement('span');
          thresholdLabel.className = 'control-label';
          thresholdLabel.innerText = 'Flag after';

          var thresholdInput = document.createElement('input');
          thresholdInput.type = 'number';
          thresholdInput.min = '1';
          thresholdInput.max = '999';
          thresholdInput.placeholder = '—';
          thresholdInput.value = saved.threshold || '';
          thresholdInput.dataset.name = list.name;
          thresholdInput.className = 'threshold-input';

          var thresholdUnit = document.createElement('span');
          thresholdUnit.className = 'control-label';
          thresholdUnit.innerText = 'days';

          thresholdWrap.appendChild(thresholdLabel);
          thresholdWrap.appendChild(thresholdInput);
          thresholdWrap.appendChild(thresholdUnit);

          // Done toggle
          var doneWrap = document.createElement('div');
          doneWrap.className = 'done-wrap';

          var doneLabel = document.createElement('span');
          doneLabel.className = 'control-label';
          doneLabel.innerText = 'Done list';

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

          controlRow.appendChild(thresholdWrap);
          controlRow.appendChild(doneWrap);

          item.appendChild(nameRow);
          item.appendChild(controlRow);
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

  t.set('board', 'shared', 'listSettings', settings).then(function() {
    t.closePopup();
  });
});
