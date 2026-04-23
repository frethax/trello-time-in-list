/* ---- ui.js — format + data helpers ---- */

var COLORS = ['#0052cc','#2ea043','#f2cc60','#db61a2','#ff7b72'];

function formatTime(ms) {
  var minutes = Math.floor(ms / (1000 * 60));
  var hours   = Math.floor(ms / (1000 * 60 * 60));
  var days    = Math.floor(hours / 24);
  var rest    = hours % 24;
  if (minutes < 60) return minutes + ' dakika';
  if (days > 0 && rest > 0) return days + ' gün ' + rest + ' saat';
  if (days > 0) return days + ' gün';
  return hours + ' saat';
}

function formatDate(d) {
  var dt = new Date(d);
  var day  = String(dt.getDate()).padStart(2,'0');
  var mon  = String(dt.getMonth()+1).padStart(2,'0');
  var h    = String(dt.getHours()).padStart(2,'0');
  var min  = String(dt.getMinutes()).padStart(2,'0');
  return day + '.' + mon + ' ' + h + ':' + min;
}

function buildTimeline(actions) {
  var timeline = [];
  var createAction = null;
  var moveActions  = [];

  actions.forEach(function(a) {
    if (a.type === 'createCard')                    createAction = a;
    else if (a.data && a.data.listAfter)            moveActions.push(a);
  });

  if (createAction && moveActions.length) {
    var initialList = (createAction.data && createAction.data.list)
      ? createAction.data.list.name
      : moveActions[0].data.listBefore && moveActions[0].data.listBefore.name;
    if (initialList) {
      timeline.push({
        list:     initialList,
        date:     new Date(createAction.date),
        duration: new Date(moveActions[0].date) - new Date(createAction.date)
      });
    }
  }

  for (var i = 0; i < moveActions.length - 1; i++) {
    var a = moveActions[i];
    var b = moveActions[i + 1];
    var diff = new Date(b.date) - new Date(a.date);
    if (diff > 0) {
      timeline.push({
        list:     a.data.listAfter.name,
        date:     new Date(a.date),
        duration: diff
      });
    }
  }

  if (moveActions.length) {
    var last = moveActions[moveActions.length - 1];
    timeline.push({
      list:     last.data.listAfter.name,
      date:     new Date(last.date),
      duration: Date.now() - new Date(last.date)
    });
  }

  return timeline;
}

function buildTotals(timeline) {
  var totals = {};
  timeline.forEach(function(t) {
    if (!totals[t.list]) totals[t.list] = 0;
    totals[t.list] += t.duration;
  });
  return totals;
}
