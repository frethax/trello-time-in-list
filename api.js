/* ---- api.js — Trello REST helpers ---- */

var TRELLO_API = 'https://api.trello.com/1';

function getActions(cardId, apiKey, token) {
  var url = TRELLO_API + '/cards/' + cardId +
    '/actions?filter=updateCard:idList,createCard' +
    '&key=' + apiKey +
    '&token=' + token;
  return fetch(url).then(function(r){ return r.json(); });
}

function getCardLabels(cardId, apiKey, token) {
  var url = TRELLO_API + '/cards/' + cardId +
    '?fields=labels' +
    '&key=' + apiKey +
    '&token=' + token;
  return fetch(url).then(function(r){ return r.json(); });
}
