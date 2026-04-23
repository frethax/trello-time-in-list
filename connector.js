/* ---- Trello Time in List — connector.js ---- */

var API_KEY = 'YOUR_API_KEY_HERE'; // Trello API key (public)

TrelloPowerUp.initialize({

  'card-back-section': function(t, options) {
    return {
      title: 'Time in List',
      icon:  'https://trello-time-in-list.vercel.app/icon-small.png',
      content: {
        type: 'iframe',
        url:  t.signUrl('https://trello-time-in-list.vercel.app/card-section.html'),
        height: 230
      }
    };
  }

}, {
  appKey:  API_KEY,
  appName: 'Trello Time in List'
});
