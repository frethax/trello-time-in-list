/* Calendar-day planning is independent of the Time in List workdays setting. */
(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.KBPlanning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  function date(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    var parsed = new Date(value + 'T00:00:00Z');
    return !isNaN(parsed) && parsed.toISOString().slice(0, 10) === value ? parsed : null;
  }
  function format(value) { return value.toISOString().slice(0, 10); }
  function add(value, days) {
    var result = date(value);
    if (!result) return null;
    result.setUTCDate(result.getUTCDate() + days);
    return format(result);
  }
  function weekdays(start, end) {
    var first = date(start), last = date(end);
    if (!first || !last || first > last) return 0;
    var total = Math.round((last - first) / 86400000) + 1;
    var count = Math.floor(total / 7) * 5;
    for (var i = 0; i < total % 7; i++) {
      var weekday = (first.getUTCDay() + i) % 7;
      if (weekday !== 0 && weekday !== 6) count++;
    }
    return count;
  }
  function overlapDays(a, b) {
    return weekdays(a.startDate > b.startDate ? a.startDate : b.startDate,
      a.endDate < b.endDate ? a.endDate : b.endDate);
  }
  function conflicts(assignments) {
    var result = {};
    assignments.forEach(function(a, i) {
      assignments.slice(i + 1).forEach(function(b) {
        if (a.memberId !== b.memberId || !overlapDays(a, b)) return;
        result[a.id] = (result[a.id] || 0) + 1;
        result[b.id] = (result[b.id] || 0) + 1;
      });
    });
    return result;
  }
  function bounds(anchor, view) {
    var d = date(anchor);
    if (!d) return null;
    if (view === 'month') {
      var first = format(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
      var last = format(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
      return { start: first, end: last };
    }
    var monday = add(anchor, -((d.getUTCDay() + 6) % 7));
    return { start: monday, end: add(monday, 6) };
  }
  return { date: date, add: add, weekdays: weekdays, overlapDays: overlapDays,
    conflicts: conflicts, bounds: bounds };
});
