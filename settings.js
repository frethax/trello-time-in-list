/* ---- settings.js — Done Lists configuration ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';
var t = TrelloPowerUp.iframe({ appKey: API_KEY, appName: 'Time in List' });

t.render(function() {
  var restApi = t.getRestApi();
  return restApi.getToken().then(function(token) {
    return Promise.all([
      t.board('id'),
      t.get('board', 'shared', 'doneLists')
    ]).then(function(results) {
      var boardId = results[0].id;
      var saved   = results[1] || [];

      return fetch(
        'https://api.trello.com/1/boards/' + boardId +
        '/lists?key=' + API_KEY + '&token=' + token
      )
      .then(function(r) { return r.json(); })
      .then(function(lists) {
        var container = document.getElementById('lists');
        container.innerHTML = '';

        lists.forEach(function(list) {
          var item = document.createElement('div');
          item.className = 'list-item';

          var nameSpan = document.createElement('span');
          nameSpan.className = 'list-name';
          nameSpan.innerText = list.name;

          var label = document.createElement('label');
          label.className = 'toggle';

          var input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = saved.indexOf(list.name) > -1;
          input.dataset.name = list.name;

          var slider = document.createElement('span');
          slider.className = 'slider';

          label.appendChild(input);
          label.appendChild(slider);
          item.appendChild(nameSpan);
          item.appendChild(label);
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
  var checked = [];
  document.querySelectorAll('input[type=checkbox]:checked').forEach(function(cb) {
    checked.push(cb.dataset.name);
  });
  t.set('board', 'shared', 'doneLists', checked).then(function() {
    t.closePopup();
  });
});
