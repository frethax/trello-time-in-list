/* ---- Trello Time in List — connector.js ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';

TrelloPowerUp.initialize({

  'card-back-section': function(t, options) {
    return {
      title: 'Trello Time in List',
      icon:  'https://trello-time-in-list.vercel.app/icon.png',
      content: {
        type:   'iframe',
        url:    t.signUrl('https://trello-time-in-list.vercel.app/card-section.html'),
        height: 260
      }
    };
  },

  'card-badges': function(t, options) {
    return t.card('id').then(function(card) {
      return fetch(
        'https://api.trello.com/1/cards/' + card.id +
        '/actions?filter=updateCard:idList&limit=1&key=' + API_KEY
      )
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.length) {
          return makeBadge(data[0].date, t);
        }
        return fetch(
          'https://api.trello.com/1/cards/' + card.id +
          '/actions?filter=createCard&limit=1&key=' + API_KEY
        )
        .then(function(r) { return r.json(); })
        .then(function(cdata) {
          if (cdata && cdata.length) {
            return makeBadge(cdata[0].date, t);
          }
          return [];
        });
      });
    });
  }

}, {
  appKey:  API_KEY,
  appName: 'Trello Time in List'
});

function makeBadge(dateStr, t) {
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
  if (minutes < 60) return minutes + 'm';
  if (days > 0 && rest > 0) return days + 'd ' + rest + 'h';
  if (days > 0) return days + 'd';
  return hours + 'h';
}
