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
  }

}, {
  appKey:   API_KEY,
  appName:  'Time in List',
  apiOrigin: 'https://api.trello.com',
  authorizeName: 'Time in List',
  authorizeButton: true,
  scope: { read: true }
});
