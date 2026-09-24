/* ---- numbering.js — Kanbrain card numbering helpers (shared) ---- */
/* Loaded by index.html (connector) and settings.html. No dependencies. */

// Note line, written in the board's selected language (plain text, no italics).
var KB_NUM_NOTES = {
  en: 'Added by Kanbrain. Used for search, please do not delete.',
  tr: 'Kanbrain tarafından eklendi. Aramada kullanılır, lütfen silmeyin.',
  es: 'Añadido por Kanbrain. Se usa para buscar, por favor no lo borres.',
  pt: 'Adicionado pelo Kanbrain. Usado na busca, por favor não apague.'
};

function kbNote(lang) {
  return KB_NUM_NOTES[lang] || KB_NUM_NOTES.en;
}

// Tolerant matcher: accepts any note line (old italic/localized ones too),
// collapsed/expanded blank lines and longer --- rules.
var KB_NUM_RE = /\n*-{3,}[ \t]*\n+🔢 \*\*([^*\n]+)\*\*([^\n]*)\n+([^\n]+)\n+-{3,}[ \t]*(\n+|$)/;

var KB_NUM_DEFAULTS = { enabled: false, prefix: '#', position: 'bottom', color: 'none' };

// Trello card-badge colors (+ 'none' = Trello's default gray badge).
// hex values are only for the settings preview swatches.
var KB_BADGE_COLORS = [
  { id: 'none',   hex: '#dfe1e6' },
  { id: 'blue',   hex: '#579dff' },
  { id: 'sky',    hex: '#6cc3e0' },
  { id: 'green',  hex: '#4bce97' },
  { id: 'lime',   hex: '#94c748' },
  { id: 'yellow', hex: '#f5cd47' },
  { id: 'orange', hex: '#fea362' },
  { id: 'red',    hex: '#f87168' },
  { id: 'pink',   hex: '#e774bb' },
  { id: 'purple', hex: '#9f8fef' }
];

function kbNormalizeNumbering(cfg) {
  cfg = cfg || {};
  return {
    enabled:  cfg.enabled === true,
    prefix:   kbSanitizePrefix(cfg.prefix),
    position: cfg.position === 'top' ? 'top' : 'bottom',
    color:    KB_BADGE_COLORS.some(function(c) { return c.id === cfg.color; }) ? cfg.color : 'none'
  };
}

// Letters, digits, # - _ . only; max 8 chars; empty -> '#'
function kbSanitizePrefix(p) {
  p = String(p == null ? '' : p).replace(/[^A-Za-z0-9#\-_.]/g, '').slice(0, 8);
  return p || '#';
}

// '#' -> '#42', 'KB' -> 'KB-42', 'KB-' -> 'KB-42'
function kbNumberLabel(prefix, idShort) {
  prefix = kbSanitizePrefix(prefix);
  return /[A-Za-z0-9]$/.test(prefix) ? prefix + '-' + idShort : prefix + idShort;
}

// Search token: a single plain alphanumeric word. Trello search treats
// '#word' as a label search and '-' as negation, so '#42' / 'NS-42' are
// unreliable queries. 'NS-42' -> 'NS42'; '#42' -> 'KB42'.
function kbSearchToken(label) {
  var tok = String(label).replace(/[^A-Za-z0-9]/g, '');
  return /[A-Za-z]/.test(tok) ? tok : 'KB' + tok;
}

function kbBuildBlock(label, lang) {
  // Blank line before the closing --- is required: without it Trello's
  // markdown turns the note line into an H2 (setext heading).
  return '---\n🔢 **' + label + '** · ' + kbSearchToken(label) + '\n' + kbNote(lang) + '\n\n---';
}

function kbRemoveNumber(desc) {
  var d = String(desc || '');
  var m = d.match(KB_NUM_RE);
  if (!m) return d;
  var before = d.slice(0, m.index).replace(/\s+$/, '');
  var after  = d.slice(m.index + m[0].length).replace(/^\s+/, '');
  return before && after ? before + '\n\n' + after : (before || after);
}

function kbApplyNumber(desc, label, position, lang) {
  // Only whitespace around the user's text is normalized; the text itself
  // is never altered or removed.
  var clean = kbRemoveNumber(desc).replace(/\s+$/, '').replace(/^\n+/, '');
  var block = kbBuildBlock(label, lang);
  if (!clean) return block;
  return position === 'top'
    ? block + '\n\n' + clean
    : clean + '\n\n' + block;
}

// True when the card already carries the right label, search token and
// note (in the board language) in the right place. Exact whitespace is
// ignored so Trello's own markdown normalization never triggers rewrites.
function kbHasCorrectNumber(desc, label, position, lang) {
  var d = String(desc || '');
  var m = d.match(KB_NUM_RE);
  if (!m || m[1].trim() !== label) return false;
  // older blocks had no search token -> treat as outdated so they get upgraded
  if (m[2].indexOf(kbSearchToken(label)) === -1) return false;
  // note must match the board language (also upgrades old italic notes)
  if (m[3].trim() !== kbNote(lang)) return false;
  var before = d.slice(0, m.index).trim();
  var after  = d.slice(m.index + m[0].length).trim();
  if (position === 'top') return before === '';
  return after === '';
}

function kbHasNumber(desc) {
  return KB_NUM_RE.test(String(desc || ''));
}

function kbBadgeColor(cfg) {
  return cfg.color && cfg.color !== 'none' ? cfg.color : null;
}

function kbColorHex(id) {
  for (var i = 0; i < KB_BADGE_COLORS.length; i++) if (KB_BADGE_COLORS[i].id === id) return KB_BADGE_COLORS[i].hex;
  return KB_BADGE_COLORS[0].hex;
}

// Write a card description. Sent as a form-encoded body (the format
// Trello's own client library uses) and verified against the response,
// so a request that "succeeds" without actually saving is reported as a
// failure. On 429 (rate limit) it waits — honoring Retry-After, else
// 2s, 4s, 8s, 16s — and retries up to 4 times.
// Resolves to { ok: bool, status: number }.
function kbPutDesc(apiKey, token, cardId, desc, attempt) {
  attempt = attempt || 0;
  var body = new URLSearchParams();
  body.set('desc', desc);
  return fetch('https://api.trello.com/1/cards/' + cardId + '?key=' + apiKey + '&token=' + token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: body.toString()
  }).then(function(r) {
    if ((r.status === 429 || r.status >= 500) && attempt < 4) {
      var ra = parseInt(r.headers.get('Retry-After'), 10);
      var wait = ra > 0 ? ra * 1000 : 2000 * Math.pow(2, attempt);
      return new Promise(function(res) { setTimeout(res, wait + Math.floor(Math.random() * 500)); })
        .then(function() { return kbPutDesc(apiKey, token, cardId, desc, attempt + 1); });
    }
    if (!r.ok) {
      return r.text().then(function(txt) {
        return { ok: false, status: r.status, message: String(txt || '').slice(0, 80) };
      }, function() { return { ok: false, status: r.status, message: '' }; });
    }
    return r.json().then(function(card) {
      var saved = card && typeof card.desc === 'string' ? card.desc : null;
      var ok = saved !== null && saved.replace(/\s+$/, '') === desc.replace(/\s+$/, '');
      return { ok: ok, status: ok ? r.status : 0 };
    }, function() { return { ok: true, status: r.status }; });
  }).catch(function() { return { ok: false, status: -1 }; });
}
