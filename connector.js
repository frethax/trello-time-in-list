/* ---- Kanbrain — connector.js ---- */

var API_KEY = '526d48a7eb9050082ce280fe0ac1a67f';

TrelloPowerUp.initialize({

  'card-back-section': function(t, options) {
    return {
      title: 'Kanbrain',
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

    // Card number badge — independent of auth and of list settings, so it
    // shows even for ignored/done lists and before the account is connected.
    var numberPart = Promise.all([
      t.get('board', 'shared', 'numbering'),
      t.get('board', 'shared', 'language'),
      t.card('id', 'idShort', 'desc')
    ]).then(function(r) {
      var cfg = kbNormalizeNumbering(r[0]);
      if (!cfg.enabled) return [];
      var card  = r[2];
      var label = kbNumberLabel(cfg.prefix, card.idShort);
      maybeSyncCardNumber(t, card, label, cfg.position, r[1] || 'en');
      return [{ text: label, color: null }];
    }).catch(function() { return []; });

    var work = restApi.getToken()
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

          // Single request instead of two sequential ones: ask for whichever
          // is more recent, the last "moved to this list" or the "card
          // created" action. If the card has ever moved, that move is
          // necessarily the newer of the two, so this is equivalent to the
          // old "try move, fall back to create" logic but at half the API
          // traffic — which was the actual source of the rate-limit bursts.
          return fetchJsonWithRetry(
            'https://api.trello.com/1/cards/' + card.id +
            '/actions?filter=updateCard:idList,createCard&limit=1&key=' + API_KEY + '&token=' + token
          )
          .then(function(data) {
            var dateStr = (data && data.length) ? data[0].date : null;
            if (!dateStr) return [];
            return makeBadge(dateStr, setting.threshold);
          });
        });
      })
      .catch(function(err) {
        // Don't silently blank the badge on a failed/rate-limited request —
        // surface a short-lived placeholder so Trello re-invokes this soon
        // and the badge self-heals without the user needing to notice/retry.
        console.warn('Kanbrain: card-badges failed, will retry shortly', err);
        return retryPlaceholderBadge();
      });

    // Belt-and-suspenders: guarantee this capability call resolves quickly
    // no matter what. On a board with many cards, a backed-up request queue
    // could otherwise leave this promise pending long enough that Trello
    // gives up waiting and shows nothing at all — which looked like "badges
    // appeared, then all vanished". Racing against a timeout means every
    // card always gets *something* back: real data, or a retry placeholder.
    var timePart = withTimeout(work, 9000, retryPlaceholderBadge());
    return Promise.all([numberPart, timePart]).then(function(parts) {
      return parts[0].concat(parts[1] || []);
    });
  },

  'board-buttons': function(t, options) {
    return [{
      text: 'Kanbrain',
      icon: {
        light: 'https://trello-time-in-list.vercel.app/icon.svg',
        dark: 'https://trello-time-in-list.vercel.app/icon-white.svg'
      },
      condition: 'admin',
      callback: function(t) {
        return t.modal({
          url:    t.signUrl('https://trello-time-in-list.vercel.app/settings.html'),
          accentColor: '#0052cc',
          height: 720,
          fullscreen: false,
          title: 'Kanbrain Settings'
        });
      }
    }];
  }

}, {
  appKey:        API_KEY,
  appName:       'Kanbrain',
  apiOrigin:     'https://api.trello.com',
  authorizeName: 'Kanbrain',
  authorizeButton: true,
  scope: { read: true }
});

// ---- Request queue -------------------------------------------------------
// 'card-badges' is invoked once per visible card, all within this same
// connector.js execution context (it's one shared iframe, not one per card).
// On board refresh Trello fires all of those near-simultaneously, so with N
// cards we were sending N fetches to api.trello.com at once, blowing through
// Trello's per-token rate limit. Retry-with-backoff alone didn't fix it
// because a big enough burst makes *every* retry collide too. Capping how
// many requests are in flight at once (independent of how many cards are
// asking) fixes it at the source.
//
// Two extra safety nets on top of the queue itself:
//  - in-flight de-dup: if Trello re-invokes card-badges for a card whose
//    previous call is still queued/running, we reuse that same promise
//    instead of enqueueing a second job. Without this, a slow-draining
//    queue causes each re-poll to add more jobs than it removes, so the
//    queue grows without bound and nothing ever finishes in time — which is
//    what made *every* badge disappear rather than just the slow ones.
//  - withTimeout() below, so a single capability call can never hang the
//    whole card indefinitely even if it's stuck deep in the queue.
var MAX_CONCURRENT_REQUESTS = 4;
var activeRequestCount = 0;
var requestQueue = [];
var pendingByUrl = {};

function pumpQueue() {
  while (activeRequestCount < MAX_CONCURRENT_REQUESTS && requestQueue.length) {
    var job = requestQueue.shift();
    activeRequestCount++;
    doFetchWithRetry(job.url, job.retriesLeft)
      .then(job.resolve, job.reject)
      .then(function() {
        activeRequestCount--;
        pumpQueue();
      });
  }
}

// Public entry point: queues the request (or joins an identical one already
// in flight) instead of firing it immediately.
function fetchJsonWithRetry(url, retriesLeft) {
  if (pendingByUrl[url]) return pendingByUrl[url];

  var p = new Promise(function(resolve, reject) {
    requestQueue.push({
      url: url,
      retriesLeft: (typeof retriesLeft === 'number') ? retriesLeft : 2,
      resolve: resolve,
      reject: reject
    });
    pumpQueue();
  });

  pendingByUrl[url] = p;
  var clear = function() { delete pendingByUrl[url]; };
  p.then(clear, clear);
  return p;
}

// Does the actual fetch + 429/5xx retry w/ backoff. Honors Retry-After.
function doFetchWithRetry(url, retriesLeft) {
  return fetch(url).then(function(r) {
    if (r.status === 429 || (r.status >= 500 && r.status < 600)) {
      if (retriesLeft > 0) {
        var retryAfterHeader = parseInt(r.headers.get('Retry-After'), 10);
        var waitMs = (retryAfterHeader > 0 ? retryAfterHeader * 1000 : 1200) +
          Math.floor(Math.random() * 600); // jitter so parallel cards don't retry in lockstep
        return new Promise(function(resolve) { setTimeout(resolve, waitMs); })
          .then(function() { return doFetchWithRetry(url, retriesLeft - 1); });
      }
      throw new Error('Trello API rate-limited/unavailable: ' + r.status);
    }
    if (!r.ok) throw new Error('Trello API error: ' + r.status);
    return r.json();
  });
}

// Races `promise` against a timeout; if it doesn't settle in `ms`,
// resolves (not rejects) with `fallbackValue` instead. The original promise
// is left running in the background — if it finishes late it just updates
// pendingByUrl/queue bookkeeping, its result is simply not waited on here.
function withTimeout(promise, ms, fallbackValue) {
  return new Promise(function(resolve) {
    var settled = false;
    var timer = setTimeout(function() {
      if (!settled) { settled = true; resolve(fallbackValue); }
    }, ms);
    promise.then(
      function(value) { if (!settled) { settled = true; clearTimeout(timer); resolve(value); } },
      function()      { if (!settled) { settled = true; clearTimeout(timer); resolve(fallbackValue); } }
    );
  });
}

// Randomized refresh (15-45s) so cards that failed/timed out together don't
// all re-poll at the exact same moment and recreate the burst.
function retryPlaceholderBadge() {
  return [{ text: '…', color: 'light-gray', refresh: 15 + Math.floor(Math.random() * 30) }];
}

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

// ---- Card numbering: write the number block into the description --------
// Runs opportunistically from card-badges: every visible card is checked
// against the expected block, and only mismatching cards are written. New
// cards therefore get their number as soon as they appear on the board.
// Writes need a token with write scope; with a read-only token the first
// 401 disables writing for this session (badge still shows the number).
var numberWriteDenied = false;
var numberSyncInFlight = {};
var numberSyncedAt = {};
var writeQueue = [];
var activeWrites = 0;
var MAX_CONCURRENT_WRITES = 2;

function maybeSyncCardNumber(t, card, label, position, lang) {
  if (numberWriteDenied) return;
  if (kbHasCorrectNumber(card.desc, label, position)) return;
  if (numberSyncInFlight[card.id]) return;
  // t.card() can be stale right after our own write — don't re-check a
  // card we synced in the last 60s.
  if (numberSyncedAt[card.id] && Date.now() - numberSyncedAt[card.id] < 60000) return;

  numberSyncInFlight[card.id] = true;
  t.getRestApi().getToken().then(function(token) {
    if (!token) return;
    return enqueueWrite(function() { return syncCardNumber(card.id, label, position, lang, token); });
  }).catch(function(err) {
    console.warn('Kanbrain: numbering sync failed', err);
  }).then(function() {
    delete numberSyncInFlight[card.id];
    numberSyncedAt[card.id] = Date.now();
  });
}

function syncCardNumber(cardId, label, position, lang, token) {
  var base = 'https://api.trello.com/1/cards/' + cardId;
  var auth = 'key=' + API_KEY + '&token=' + token;
  // Re-read the latest description right before writing so an edit the
  // user just made is never overwritten.
  return fetch(base + '?fields=desc&' + auth).then(function(r) {
    if (r.status === 401) { numberWriteDenied = true; return null; }
    return r.ok ? r.json() : null;
  }).then(function(fresh) {
    if (!fresh || numberWriteDenied) return;
    if (kbHasCorrectNumber(fresh.desc, label, position)) return;
    var desc = kbApplyNumber(fresh.desc, label, position, lang);
    if (desc.length > 16384) return; // Trello's description limit
    return fetch(base + '?' + auth, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desc: desc })
    }).then(function(r) {
      if (r.status === 401) numberWriteDenied = true;
    });
  });
}

function enqueueWrite(job) {
  return new Promise(function(resolve, reject) {
    writeQueue.push({ job: job, resolve: resolve, reject: reject });
    pumpWrites();
  });
}

function pumpWrites() {
  while (activeWrites < MAX_CONCURRENT_WRITES && writeQueue.length) {
    var w = writeQueue.shift();
    activeWrites++;
    w.job().then(w.resolve, w.reject).then(function() {
      // small gap between writes keeps us far below the 100 req/10s limit
      setTimeout(function() { activeWrites--; pumpWrites(); }, 250);
    });
  }
}
