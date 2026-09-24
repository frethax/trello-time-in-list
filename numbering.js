/* ---- numbering.js — Kanbrain card numbering helpers (shared) ---- */
/* Loaded by index.html (connector) and settings.html. No dependencies. */

var KB_NUM_NOTES = {
  en: 'Added by Kanbrain. Used for search, please do not delete.',
  tr: 'Kanbrain tarafından eklendi. Aramada kullanılır, lütfen silmeyin.',
  es: 'Añadido por Kanbrain. Se usa para buscar, por favor no lo borres.',
  pt: 'Adicionado pelo Kanbrain. Usado na busca, por favor não apague.'
};

// Tolerant matcher: survives Trello's editor rewriting _italic_ as *italic*,
// collapsing/expanding blank lines, or longer --- rules.
var KB_NUM_RE = /\n*-{3,}[ \t]*\n+🔢 \*\*([^*\n]+)\*\*[ \t]*\n+[_*][^\n]*[_*][ \t]*\n+-{3,}[ \t]*(\n+|$)/;

var KB_NUM_DEFAULTS = { enabled: false, prefix: '#', position: 'bottom' };

function kbNormalizeNumbering(cfg) {
  cfg = cfg || {};
  return {
    enabled:  cfg.enabled === true,
    prefix:   kbSanitizePrefix(cfg.prefix),
    position: cfg.position === 'top' ? 'top' : 'bottom'
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

function kbBuildBlock(label, lang) {
  var note = KB_NUM_NOTES[lang] || KB_NUM_NOTES.en;
  // Blank line before the closing --- is required: without it Trello's
  // markdown turns the note line into an H2 (setext heading).
  return '---\n🔢 **' + label + '**\n_' + note + '_\n\n---';
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
  var before = d.slice(0, m.index).trim();
  var after  = d.slice(m.index + m[0].length).trim();
  if (position === 'top') return before === '';
  return after === '';
}

function kbHasNumber(desc) {
  return KB_NUM_RE.test(String(desc || ''));
}
