/* ---- subtasks.js — Kanbrain main task / subtask links (shared) ---- */
/* Loaded by index.html (connector) and settings.html. Needs numbering.js.
   Storage (card-shared plugin data, no REST token needed):
     child card : kbParent   = parent card id
     parent card: kbChildren = [child card ids]
   The child's kbParent is the source of truth; kbChildren is a fast index
   for the parent's badge and is filtered against open cards when shown. */

var KB_SUB_DEFAULTS = { enabled: true, display: 'both', showOnParent: true, color: 'purple' };
var KB_MAIN_TASK_LABEL = 'Main Task';
var KB_SUB_NAME_MAX = 24;

function kbNormalizeSubtasks(cfg) {
  cfg = cfg || {};
  var colors = (typeof KB_BADGE_COLORS !== 'undefined') ? KB_BADGE_COLORS : [];
  return {
    enabled:      cfg.enabled !== false,
    display:      ['number', 'name', 'both'].indexOf(cfg.display) !== -1 ? cfg.display : 'both',
    showOnParent: cfg.showOnParent !== false,
    color:        colors.some(function(c) { return c.id === cfg.color; }) ? cfg.color : KB_SUB_DEFAULTS.color
  };
}

function kbTruncate(s, max) {
  s = String(s || '');
  return s.length > max ? s.slice(0, max - 1).replace(/\s+$/, '') + '…' : s;
}

// Card reference used in badges/pickers: numbering prefix when enabled, else '#'.
function kbCardRef(card, numCfg) {
  var prefix = numCfg && numCfg.enabled ? numCfg.prefix : '#';
  return kbNumberLabel(prefix, card.idShort);
}

function kbParentBadgeText(parent, numCfg, subCfg) {
  var ref = kbCardRef(parent, numCfg);
  var name = kbTruncate(parent.name, KB_SUB_NAME_MAX);
  var body = subCfg.display === 'number' ? ref
           : subCfg.display === 'name'   ? name
           : ref + ' · ' + name;
  return KB_MAIN_TASK_LABEL + ': ' + body;
}

// ---- Board card cache (card-badges runs once per card) --------------------
var kbCardsCache = { at: 0, promise: null };
function kbBoardCards(t) {
  if (kbCardsCache.promise && Date.now() - kbCardsCache.at < 20000) return kbCardsCache.promise;
  kbCardsCache.at = Date.now();
  kbCardsCache.promise = t.cards('id', 'name', 'idShort').catch(function() {
    kbCardsCache.at = 0; return [];
  });
  return kbCardsCache.promise;
}
function kbInvalidateCards() { kbCardsCache.at = 0; }

// ---- Link management -------------------------------------------------------
function kbGetParent(t, cardId) {
  return t.get(cardId, 'shared', 'kbParent').catch(function() { return null; });
}
function kbGetChildren(t, cardId) {
  return t.get(cardId, 'shared', 'kbChildren')
    .then(function(v) { return Array.isArray(v) ? v : []; })
    .catch(function() { return []; });
}

// Links childId under parentId (or unlinks when parentId is null),
// keeping both sides in sync. Rejects links that would create a loop.
function kbSetParent(t, childId, parentId) {
  if (parentId === childId) return Promise.reject(new Error('self'));
  var check = parentId
    ? kbGetParent(t, parentId).then(function(pp) {
        if (pp === childId) throw new Error('cycle');
      })
    : Promise.resolve();
  return check.then(function() { return kbGetParent(t, childId); }).then(function(oldParent) {
    var steps = [];
    if (oldParent && oldParent !== parentId) {
      steps.push(kbGetChildren(t, oldParent).then(function(list) {
        return t.set(oldParent, 'shared', 'kbChildren',
          list.filter(function(id) { return id !== childId; }));
      }));
    }
    if (parentId) {
      steps.push(t.set(childId, 'shared', 'kbParent', parentId));
      steps.push(kbGetChildren(t, parentId).then(function(list) {
        if (list.indexOf(childId) === -1) list.push(childId);
        return t.set(parentId, 'shared', 'kbChildren', list);
      }));
    } else {
      steps.push(t.remove(childId, 'shared', 'kbParent'));
    }
    return Promise.all(steps);
  }).then(kbInvalidateCards);
}

// ---- Pickers (card-buttons) ------------------------------------------------
function kbPickerItems(t, cards, excludeIds, numCfg, onPick) {
  return cards
    .filter(function(c) { return excludeIds.indexOf(c.id) === -1; })
    .sort(function(a, b) { return b.idShort - a.idShort; })
    .map(function(c) {
      return {
        text: kbCardRef(c, numCfg) + ' · ' + c.name,
        callback: function(t2) { return onPick(t2, c); }
      };
    });
}

// "Main Task" button: choose this card's main task.
function kbOpenParentPicker(t, opts) {
  return Promise.all([
    t.card('id'), kbBoardCards(t), t.get('board', 'shared', 'numbering')
  ]).then(function(r) {
    var me = r[0].id, cards = r[1], numCfg = kbNormalizeNumbering(r[2]);
    return Promise.all([kbGetParent(t, me), kbGetChildren(t, me)]).then(function(rel) {
      var parent = rel[0], children = rel[1];
      var items = [];
      if (parent) {
        items.push({ text: '✕ Remove main task', callback: function(t2) {
          return kbSetParent(t2, me, null).then(function() { return t2.closePopup(); });
        }});
      }
      items = items.concat(kbPickerItems(t, cards, [me, parent].concat(children), numCfg,
        function(t2, c) {
          return kbSetParent(t2, me, c.id).then(function() { return t2.closePopup(); })
            .catch(function() { return t2.closePopup(); });
        }));
      return t.popup({
        title: 'Select main task',
        mouseEvent: opts && opts.mouseEvent,
        items: items,
        search: { count: 10, placeholder: 'Search by name or number', empty: 'No cards found' }
      });
    });
  });
}

// "Add Subtask" button: make another card a subtask of this card.
function kbOpenChildPicker(t, opts) {
  return Promise.all([
    t.card('id'), kbBoardCards(t), t.get('board', 'shared', 'numbering')
  ]).then(function(r) {
    var me = r[0].id, cards = r[1], numCfg = kbNormalizeNumbering(r[2]);
    return Promise.all([kbGetParent(t, me), kbGetChildren(t, me)]).then(function(rel) {
      var exclude = [me, rel[0]].concat(rel[1]);
      return t.popup({
        title: 'Add subtask',
        mouseEvent: opts && opts.mouseEvent,
        items: kbPickerItems(t, cards, exclude, numCfg, function(t2, c) {
          return kbSetParent(t2, c.id, me).then(function() { return t2.closePopup(); })
            .catch(function() { return t2.closePopup(); });
        }),
        search: { count: 10, placeholder: 'Search by name or number', empty: 'No cards found' }
      });
    });
  });
}

// Subtask list popup (from the parent's detail badge).
function kbOpenChildrenList(t, children, numCfg, opts) {
  return t.popup({
    title: 'Subtasks',
    mouseEvent: opts && opts.mouseEvent,
    items: children.map(function(c) {
      return {
        text: kbCardRef(c, numCfg) + ' · ' + c.name,
        callback: function(t2) { return t2.showCard(c.id); }
      };
    })
  });
}

// ---- Badges ----------------------------------------------------------------
// Resolves { parent, children, subCfg, numCfg } for the current card.
function kbSubtaskContext(t) {
  return Promise.all([
    t.get('board', 'shared', 'subtasks'),
    t.get('board', 'shared', 'numbering'),
    t.card('id')
  ]).then(function(r) {
    var subCfg = kbNormalizeSubtasks(r[0]);
    var numCfg = kbNormalizeNumbering(r[1]);
    if (!subCfg.enabled) return null;
    var me = r[2].id;
    return Promise.all([kbGetParent(t, me), kbGetChildren(t, me)]).then(function(rel) {
      if (!rel[0] && !rel[1].length) return { parent: null, children: [], subCfg: subCfg, numCfg: numCfg };
      return kbBoardCards(t).then(function(cards) {
        var byId = {};
        cards.forEach(function(c) { byId[c.id] = c; });
        return {
          parent:   rel[0] ? byId[rel[0]] || null : null,   // archived parent -> hidden
          children: rel[1].map(function(id) { return byId[id]; }).filter(Boolean),
          subCfg: subCfg, numCfg: numCfg
        };
      });
    });
  });
}

function kbSubtaskBadges(t) {
  return kbSubtaskContext(t).then(function(ctx) {
    if (!ctx) return [];
    var color = kbBadgeColor(ctx.subCfg);
    var out = [];
    if (ctx.parent) out.push({ text: kbParentBadgeText(ctx.parent, ctx.numCfg, ctx.subCfg), color: color });
    if (ctx.subCfg.showOnParent && ctx.children.length) {
      out.push({ text: KB_MAIN_TASK_LABEL + ' · ' + ctx.children.length, color: color });
    }
    return out;
  }).catch(function() { return []; });
}

function kbSubtaskDetailBadges(t) {
  return kbSubtaskContext(t).then(function(ctx) {
    if (!ctx) return [];
    var color = kbBadgeColor(ctx.subCfg);
    var out = [];
    if (ctx.parent) {
      var p = ctx.parent;
      out.push({
        title: KB_MAIN_TASK_LABEL,
        text: kbCardRef(p, ctx.numCfg) + ' · ' + kbTruncate(p.name, 40),
        color: color,
        callback: function(t2) { return t2.showCard(p.id); }
      });
    }
    if (ctx.children.length) {
      var kids = ctx.children;
      out.push({
        title: 'Subtasks',
        text: String(kids.length),
        color: color,
        callback: function(t2) { return kbOpenChildrenList(t2, kids, ctx.numCfg); }
      });
    }
    return out;
  }).catch(function() { return []; });
}
