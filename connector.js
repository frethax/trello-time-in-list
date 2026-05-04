/* ---- Trello Time in List — connector.js ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';

TrelloPowerUp.initialize({

  'card-back-section': function(t, options) {
    return {
      title: 'Time in List',
      icon:  'https://trello-time-in-list.vercel.app/icon.png',
      content: {
        type:   'iframe',
        url:    t.signUrl('https://trello-time-in-list.vercel.app/card-section.html'),
        height: 260
      }
    };
  },

  'card-badges': function(t, options) {
    var restApi = t.getRestApi();
    return restApi.getToken()
      .then(function(token) {
        if (!token) return [];
        return t.card('id').then(function(card) {
          return fetch(
            'https://api.trello.com/1/cards/' + card.id +
            '/actions?filter=updateCard:idList&limit=1&key=' + API_KEY + '&token=' + token
          )
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data && data.length) {
              return makeBadge(data[0].date, t, token, card.id);
            }
            return fetch(
              'https://api.trello.com/1/cards/' + card.id +
              '/actions?filter=createCard&limit=1&key=' + API_KEY + '&token=' + token
            )
            .then(function(r) { return r.json(); })
            .then(function(cdata) {
              if (cdata && cdata.length) return makeBadge(cdata[0].date, t, token, card.id);
              return [];
            });
          });
        });
      })
      .catch(function() { return []; });
  }

}, {
  appKey:   API_KEY,
  appName:  'Time in List',
  apiOrigin: 'https://api.trello.com',
  authorizeName: 'Time in List',
  authorizeButton: true,
  scope: { read: true }
});

function makeBadge(dateStr, t, token, cardId) {
  return t.get('board', 'shared', 'thresholdDays').then(function(val) {
    var thresholdDays = (val && !isNaN(val)) ? parseInt(val) : 3;
    var diff  = Date.now() - new Date(dateStr);
    var isRed = diff > (thresholdDays * 24 * 60 * 60 * 1000);
    return [{
      text:    formatTime(diff),
      color:   isRed ? 'red' : 'green',
      refresh: 3600
    }];
  });
}

function formatTime(ms) {
  var minutes = Math.floor(ms / (1000 * 60));
  var hours   = Math.floor(ms / (1000 * 60 * 60));
  var days    = Math.floor(hours / 24);
  var rest    = hours % 24;
  if (minutes < 60) return minutes + ' min';
  if (days > 0 && rest > 0) return days + ' days ' + rest + ' hours';
  if (days > 0) return days + ' days';
  return hours + ' hours';
}
