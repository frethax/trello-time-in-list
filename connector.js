/* ---- ListClock — connector.js ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';

TrelloPowerUp.initialize({

  'card-back-section': function(t, options) {
    return {
      title: 'ListClock',
      icon:  'https://trello-time-in-list.vercel.app/icon.svg',
      content: {
        type:   'iframe',
        url:    t.signUrl('https://trello-time-in-list.vercel.app/card-section.html'),
        height: 400
      }
    };
  },

  'card-badges': function(t, options) {
    var restApi = t.getRestApi();
    return restApi.getToken()
      .then(function(token) {
        if (!token) return [];
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
          var setting = listSettings[currentListName] || {};

          if (setting.ignore) return [];

          if (setting.done) {
            return [{ text: '✓ Done', color: 'green', refresh: 86400 }];
          }

          return fetch(
            'https://api.trello.com/1/cards/' + card.id +
            '/actions?filter=updateCard:idList&limit=1&key=' + API_KEY + '&token=' + token
          )
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var dateStr = (data && data.length) ? data[0].date : null;
            if (!dateStr) {
              return fetch(
                'https://api.trello.com/1/cards/' + card.id +
                '/actions?filter=createCard&limit=1&key=' + API_KEY + '&token=' + token
              )
              .then(function(r) { return r.json(); })
              .then(function(cdata) {
                if (cdata && cdata.length) return makeBadge(cdata[0].date, setting.threshold);
                return [];
              });
            }
            return makeBadge(dateStr, setting.threshold);
          });
        });
      })
      .catch(function() { return []; });
  },

  'board-buttons': function(t, options) {
    return [{
      text: 'ListClock',
      icon: {
        light: 'https://trello-time-in-list.vercel.app/icon.svg',
        dark: 'https://trello-time-in-list.vercel.app/icon-white.svg'
      },
      condition: 'admin',
      callback: function(t) {
        return t.modal({
          url:    t.signUrl('https://trello-time-in-list.vercel.app/settings.html'),
          accentColor: '#0052cc',
          height: 600,
          fullscreen: false,
          title: 'ListClock Settings'
        });
      }
    }];
  }

}, {
  appKey:        API_KEY,
  appName:       'ListClock',
  apiOrigin:     'https://api.trello.com',
  authorizeName: 'ListClock',
  authorizeButton: true,
  scope: { read: true }
});

function makeBadge(dateStr, threshold) {
  var diff = Date.now() - new Date(dateStr);
  var thresholdMs = threshold ? threshold * 24 * 60 * 60 * 1000 : 3 * 24 * 60 * 60 * 1000;
  var isRed = diff > thresholdMs;
  return [{
    text:    formatTime(diff),
    color:   isRed ? 'red' : 'green',
    refresh: 3600
  }];
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
