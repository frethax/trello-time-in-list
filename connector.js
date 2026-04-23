/* ---- Trello Time in List — connector.js ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';

var DEFAULT_THRESHOLD_DAYS = 3;

TrelloPowerUp.initialize({

  'card-back-section': function(t, options) {
    return {
      title: 'Trello Time in List',
      icon:  'https://trello-time-in-list.vercel.app/icon.png',
      content: {
        type: 'iframe',
        url:  t.signUrl('https://trello-time-in-list.vercel.app/card-section.html'),
        height: 260
      }
    };
  },

  'card-badges': function(t, options) {
    return t.get('board', 'shared', 'thresholdDays', DEFAULT_THRESHOLD_DAYS).then(function(thresholdDays) {
      return t.card('id').then(function(card) {
        return fetch(
          'https://api.trello.com/1/cards/' + card.id +
          '/actions?filter=updateCard:idList&limit=1&key=' + API_KEY
        ).then(function(r){ return r.json(); }).then(function(data) {
          var lastMove;
          if (data.length) {
            lastMove = new Date(data[0].date);
          } else {
            return fetch(
              'https://api.trello.com/1/cards/' + card.id +
              '/actions?filter=createCard&limit=1&key=' + API_KEY
            ).then(function(r){ return r.json(); }).then(function(cdata) {
              if (!cdata.length) return [];
              lastMove = new Date(cdata[0].date);
              return buildBadge(lastMove, thresholdDays);
            });
          }
          return buildBadge(lastMove, thresholdDays);
        });
      });
    });
  },

  'board-buttons': function(t, options) {
    return [{
      text: 'Time in List Settings',
      icon: 'https://trello-time-in-list.vercel.app/icon.png',
      condition: 'admin',
      callback: function(t) {
        return t.get('board', 'shared', 'thresholdDays', DEFAULT_THRESHOLD_DAYS).then(function(current) {
          var days = prompt('Red badge threshold (days):', current);
          if (days && !isNaN(days)) {
            return t.set('board', 'shared', 'thresholdDays', parseInt(days));
          }
        });
      }
    }];
  }

}, {
  appKey:  API_KEY,
  appName: 'Trello Time in List'
});

function buildBadge(lastMove, thresholdDays) {
  var diff = Date.now() - lastMove;
  var isRed = diff > (thresholdDays * 24 * 60 * 60 * 1000);
  return [{
    text:  formatTime(diff),
    color: isRed ? 'red' : 'green'
  }];
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
