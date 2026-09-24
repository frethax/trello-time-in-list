/* ---- numbering.js — Kanbrain card numbering helpers (shared) ---- */
/* Loaded by index.html (connector) and settings.html. No dependencies. */

var KB_NUM_NOTE = 'Added by Kanbrain. Used for search, please do not delete.';

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
  return '---\n🔢 **' + label + '** · ' + kbSearchToken(label) + '\n' + KB_NUM_NOTE + '\n\n---';
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
  var clean = kbRemoveNumber(desc).trim();
  var block = kbBuildBlock(label, lang);
  if (!clean) return block;
  return position === 'top'
    ? block + '\n\n' + clean
    : clean + '\n\n' + block;
}

// True when the card already carries the right label in the right place.
// Deliberately ignores the note text / exact whitespace so a language
// switch or Trello's own markdown normalization never triggers rewrites.
function kbHasCorrectNumber(desc, label, position) {
  var d = String(desc || '');
  var m = d.match(KB_NUM_RE);
  if (!m || m[1].trim() !== label) return false;
  // older blocks had no search token -> treat as outdated so they get upgraded
  if (m[2].indexOf(kbSearchToken(label)) === -1) return false;
  // older blocks had a localized / italic note -> upgrade to plain English
  if (m[3].trim() !== KB_NUM_NOTE) return false;
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
