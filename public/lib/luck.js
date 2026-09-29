/* Luck pillars (大运 / 流年 / 流月) for BaZi.
   Works in the browser and in Node. Needs an EightChar object from lunar-javascript.

   The rules implemented here are the standard ones:
     - direction: a yang year with a male, or a yin year with a female, runs forward (顺行);
       the other two combinations run backward (逆行)
     - the first luck pillar is the month pillar stepped one place along the sexagenary
       cycle in that direction, and every following pillar is ten years on
     - the start age comes from the distance between the birth moment and the
       neighbouring jie solar term, three days counting as one year (sect 1)

   Gender is 1 for male and 0 for female. Sect 1 is the traditional three-days-to-a-year
   count; sect 2 counts exact minutes. */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.BaziLuck = factory();
})(typeof self !== "undefined" ? self : this, function () {

  /* How many ten-year pillars to show. Nine covers about ninety years of life. */
  var DEFAULT_PILLARS = 9;
  var YEARS_PER_PILLAR = 10;

  function build(eightChar, gender, sect, pillars) {
    var g = Number(gender) === 0 ? 0 : 1;
    var yun = eightChar.getYun(g, Number(sect) === 2 ? 2 : 1);
    var count = (pillars || DEFAULT_PILLARS) + 1;

    var raw = yun.getDaYun(count);
    var daYun = [];

    for (var i = 1; i < raw.length; i++) {
      var d = raw[i];
      var liuNian = d.getLiuNian(YEARS_PER_PILLAR).map(function (n) {
        return {
          year: n.getYear(),
          age: n.getAge(),
          ganZhi: n.getGanZhi(),
          liuYue: n.getLiuYue().map(function (m) {
            return {
              index: m.getIndex(),
              monthName: m.getMonthInChinese(),
              ganZhi: m.getGanZhi()
            };
          })
        };
      });
      daYun.push({
        index: d.getIndex(),
        ganZhi: d.getGanZhi(),
        startYear: d.getStartYear(),
        endYear: d.getEndYear(),
        startAge: d.getStartAge(),
        endAge: d.getEndAge(),
        liuNian: liuNian
      });
    }

    var startSolar = yun.getStartSolar();

    return {
      gender: g,
      forward: yun.isForward(),
      startYears: yun.getStartYear(),
      startMonths: yun.getStartMonth(),
      startDays: yun.getStartDay(),
      startSolarDate: startSolar.toYmd(),
      firstStartYear: daYun.length ? daYun[0].startYear : null,
      daYun: daYun
    };
  }

  /* Which luck pillar holds a given calendar year, or -1 when it is outside the range. */
  function indexForYear(luck, year) {
    for (var i = 0; i < luck.daYun.length; i++) {
      if (year >= luck.daYun[i].startYear && year <= luck.daYun[i].endYear) return i;
    }
    return -1;
  }

  /* "1 year 4 months" style text for the start offset. */
  function startText(luck) {
    var parts = [];
    if (luck.startYears) parts.push(luck.startYears + (luck.startYears === 1 ? " year" : " years"));
    if (luck.startMonths) parts.push(luck.startMonths + (luck.startMonths === 1 ? " month" : " months"));
    if (!parts.length) parts.push(luck.startDays + (luck.startDays === 1 ? " day" : " days"));
    return parts.join(" ");
  }

  return {
    build: build,
    indexForYear: indexForYear,
    startText: startText,
    DEFAULT_PILLARS: DEFAULT_PILLARS,
    YEARS_PER_PILLAR: YEARS_PER_PILLAR
  };
});
