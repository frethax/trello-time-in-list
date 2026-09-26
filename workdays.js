/* ---- workdays.js — optional "working days only" time calculation ----
   Loaded by index.html (connector), card-section.html and settings.html.
   Setting: board-shared 'workdays' = { enabled: bool }.
   When enabled, every duration Kanbrain shows (badges, panel, timeline,
   export, red-flag thresholds) skips Saturdays and Sundays, measured in
   the viewer's local time zone. */

var KB_WEEKEND_DAYS = [0, 6]; // Sunday, Saturday (Date#getDay)

function kbNormalizeWorkdays(cfg) {
  return { enabled: !!(cfg && cfg.enabled === true) };
}

// Milliseconds between start and end, excluding weekend time when enabled.
function kbWorkMs(start, end, enabled) {
  var s = new Date(start).getTime(), e = new Date(end).getTime();
  if (!(e > s)) return 0;
  if (!enabled) return e - s;
  var total = 0, cur = s;
  while (cur < e) {
    var d = new Date(cur);
    var nextMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    var segEnd = Math.min(nextMidnight, e);
    if (KB_WEEKEND_DAYS.indexOf(d.getDay()) === -1) total += segEnd - cur;
    cur = segEnd;
  }
  return total;
}

// Convenience: time from a date until now.
function kbWorkMsSince(start, enabled) {
  return kbWorkMs(start, Date.now(), enabled);
}
