/* True-solar-time engine for BaZi.
   Works in the browser and in Node. Relies on:
     - Intl.DateTimeFormat timeZone support (historical DST / tz rules)
     - lunar-javascript (UMD) for solar terms, lunar calendar and the four pillars
*/
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.BaziEngine = factory();
})(typeof self !== "undefined" ? self : this, function () {

  var MS_MIN = 60000, MS_DAY = 86400000;

  var _dtfCache = {};
  function dtfFor(tz) {
    if (!_dtfCache[tz]) {
      _dtfCache[tz] = new Intl.DateTimeFormat("en-US", {
        timeZone: tz, hourCycle: "h23",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
    }
    return _dtfCache[tz];
  }

  /* Minutes that the given zone is ahead of UTC at the given instant. */
  function tzOffsetMinutes(tz, utcMs) {
    var dtf = dtfFor(tz);
    var p = {};
    var parts = dtf.formatToParts(new Date(utcMs));
    for (var i = 0; i < parts.length; i++) p[parts[i].type] = parts[i].value;
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return Math.round((asUTC - utcMs) / MS_MIN);
  }

  /* Wall-clock time at a place -> the UTC instant it refers to.
     Iterates because the offset itself depends on the instant. */
  function wallToUtc(y, mo, d, h, mi, s, tz) {
    var naive = Date.UTC(y, mo - 1, d, h, mi, s || 0);
    var utc = naive, off = 0;
    for (var i = 0; i < 3; i++) {
      off = tzOffsetMinutes(tz, utc);
      var next = naive - off * MS_MIN;
      if (next === utc) break;
      utc = next;
    }
    off = tzOffsetMinutes(tz, utc);
    return { utcMs: utc, offsetMinutes: off };
  }

  /* Equation of time in minutes (NOAA). Range is about -14.2 .. +16.4. */
  function equationOfTimeMinutes(utcMs) {
    var dt = new Date(utcMs);
    var yearStart = Date.UTC(dt.getUTCFullYear(), 0, 1);
    var doy = (utcMs - yearStart) / MS_DAY;
    var hoursUTC = dt.getUTCHours() + dt.getUTCMinutes() / 60 + dt.getUTCSeconds() / 3600;
    var g = (2 * Math.PI / 365) * (doy + (hoursUTC - 12) / 24);
    return 229.18 * (0.000075
      + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
      - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  }

  /* The zone's standard (winter) offset for that year, ignoring any daylight saving.
     Taking the smaller of January and July works in both hemispheres. */
  function standardOffsetMinutes(tz, utcMs) {
    var y = new Date(utcMs).getUTCFullYear();
    var jan = tzOffsetMinutes(tz, Date.UTC(y, 0, 15, 12, 0, 0));
    var jul = tzOffsetMinutes(tz, Date.UTC(y, 6, 15, 12, 0, 0));
    return Math.min(jan, jul);
  }

  /* How many minutes of daylight saving were in force at that instant (0 if none). */
  function dstMinutes(tz, utcMs) {
    return Math.max(0, tzOffsetMinutes(tz, utcMs) - standardOffsetMinutes(tz, utcMs));
  }

  function fmtOffset(mins) {
    var sign = mins < 0 ? "-" : "+";
    var a = Math.abs(mins);
    return "UTC" + sign + String(Math.floor(a / 60)).padStart(2, "0") + ":" + String(a % 60).padStart(2, "0");
  }

  /* The whole chain: wall clock at a place -> true solar time.
     opts.useEquationOfTime  (default true)
     opts.forceOffsetMinutes (optional override, for stations using an unofficial clock) */
  function toTrueSolarTime(input) {
    var y = input.year, mo = input.month, d = input.day, h = input.hour, mi = input.minute;
    var lng = input.longitude, tz = input.timezone;
    var removeDST = !!input.stripDST;

    var conv = wallToUtc(y, mo, d, h, mi, 0, tz);
    var offset = conv.offsetMinutes;

    /* Strip a daylight-saving hour so the clock is read as standard time.
       Needed for places that kept wartime/unofficial clocks. */
    var dstShift = 0;
    if (removeDST) {
      var jan = tzOffsetMinutes(tz, Date.UTC(y, 0, 15, 12, 0, 0));
      var jul = tzOffsetMinutes(tz, Date.UTC(y, 6, 15, 12, 0, 0));
      var standard = Math.min(jan, jul);
      dstShift = Math.max(0, offset - standard);
    }
    var effectiveOffset = offset - dstShift;

    /* Local mean time: every degree away from the zone meridian is 4 minutes. */
    var meridian = effectiveOffset / 4;                    /* offset minutes / 4 = degrees */
    var longitudeMinutes = 4 * (lng - meridian);

    var eot = input.useEquationOfTime === false ? 0 : equationOfTimeMinutes(conv.utcMs);

    var totalMinutes = h * 60 + mi + longitudeMinutes + eot;
    var dayShift = Math.floor(totalMinutes / 1440);
    var within = ((totalMinutes % 1440) + 1440) % 1440;
    var tHour = Math.floor(within / 60);
    var tMinute = within - tHour * 60;
    var tSecond = Math.round((tMinute - Math.floor(tMinute)) * 60);
    tMinute = Math.floor(tMinute);
    if (tSecond === 60) { tSecond = 0; tMinute++; }
    if (tMinute === 60) { tMinute = 0; tHour++; }
    if (tHour === 24) { tHour = 0; dayShift++; }

    var baseUtc = Date.UTC(y, mo - 1, d);
    var solarDate = new Date(baseUtc + dayShift * MS_DAY);

    return {
      solar: {
        year: solarDate.getUTCFullYear(),
        month: solarDate.getUTCMonth() + 1,
        day: solarDate.getUTCDate(),
        hour: tHour, minute: tMinute, second: tSecond
      },
      breakdown: {
        clock: { year: y, month: mo, day: d, hour: h, minute: mi },
        timezone: tz,
        utcMs: conv.utcMs,
        utcOffsetMinutes: offset,
        dstAppliedMinutes: dstShift,
        effectiveOffsetMinutes: effectiveOffset,
        utcOffsetLabel: fmtOffset(offset),
        zoneMeridian: meridian,
        longitude: lng,
        longitudeCorrectionMinutes: longitudeMinutes,
        equationOfTimeMinutes: eot,
        dayShift: dayShift,
        totalShiftMinutes: longitudeMinutes + eot
      }
    };
  }

  return {
    tzOffsetMinutes: tzOffsetMinutes,
    standardOffsetMinutes: standardOffsetMinutes,
    dstMinutes: dstMinutes,
    wallToUtc: wallToUtc,
    equationOfTimeMinutes: equationOfTimeMinutes,
    toTrueSolarTime: toTrueSolarTime,
    fmtOffset: fmtOffset
  };
});
