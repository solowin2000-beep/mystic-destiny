/*
 * 排盘引擎回归测试。
 * 用法（在项目根目录）：  node tools/regression.cjs
 *
 * 校验三件事：
 *   1. 真太阳时链路（历史时区 / 夏令时 / 经度 / 均时差）
 *   2. 四柱边界（立春换年、节气换月由历法库保证）
 *   3. 两个公认锚点 + 晚子时两种流派
 * 改动 public/lib/ 下的任何文件之后，务必重跑一遍。
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = {};
vm.createContext(sandbox);

// lunar.js 和 engine.js 都是 UMD，在干净的 vm 上下文里会把 API 挂到全局对象上
for (const f of ["public/lib/lunar.js", "public/lib/engine.js", "public/lib/luck.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), sandbox, { filename: f });
}
const { Solar, BaziEngine, BaziLuck } = sandbox;

let pass = 0, fail = 0;
function check(label, got, want) {
  const ok = String(got) === String(want);
  if (ok) pass++; else fail++;
  console.log((ok ? "  ok   " : "  FAIL ") + label + (ok ? "" : "   got " + got + ", want " + want));
}
const pad = (n) => String(n).padStart(2, "0");

function chart(y, mo, d, h, mi, lng, tz, sect) {
  const r = BaziEngine.toTrueSolarTime({ year: y, month: mo, day: d, hour: h, minute: mi, longitude: lng, timezone: tz });
  const s = r.solar;
  const ec = Solar.fromYmdHms(s.year, s.month, s.day, s.hour, s.minute, 0).getLunar().getEightChar();
  ec.setSect(sect === undefined ? 2 : sect);
  return {
    solar: pad(s.hour) + ":" + pad(s.minute),
    date: s.year + "-" + pad(s.month) + "-" + pad(s.day),
    b: r.breakdown,
    day: ec.getDay(),
    hour: ec.getTime(),
    pillars: "年" + ec.getYear() + " 月" + ec.getMonth() + " 日" + ec.getDay() + " 时" + ec.getTime(),
  };
}

console.log("1. Day pillar against published anchors");
for (const [y, mo, d, want] of [[1949, 10, 1, "甲子"], [2000, 1, 1, "戊午"], [1988, 6, 1, "丁亥"]]) {
  const ec = Solar.fromYmdHms(y, mo, d, 12, 0, 0).getLunar().getEightChar();
  check(y + "-" + pad(mo) + "-" + pad(d) + " day pillar", ec.getDay(), want);
}

console.log("2. Year pillar changes at lichun (2000-02-04 20:40:24 Beijing)");
check("2000-02-04 20:00 year", Solar.fromYmdHms(2000, 2, 4, 20, 0, 0).getLunar().getEightChar().getYear(), "己卯");
check("2000-02-04 21:00 year", Solar.fromYmdHms(2000, 2, 4, 21, 0, 0).getLunar().getEightChar().getYear(), "庚辰");

console.log("3. True solar time chain");
const bj = chart(1988, 6, 1, 12, 0, 116.388, "Asia/Shanghai");
check("Beijing 1988-06-01 12:00 solar time", bj.solar, "10:48");
check("Beijing 1988-06-01 pillars", bj.pillars, "年戊辰 月丁巳 日丁亥 时乙巳");
check("Beijing 1988-06-01 offset (China summer time)", bj.b.utcOffsetLabel, "UTC+09:00");
check("Beijing 1988-06-01 longitude correction", bj.b.longitudeCorrectionMinutes.toFixed(1), "-74.4");
check("Beijing 1988-06-01 equation of time", bj.b.equationOfTimeMinutes.toFixed(1), "2.5");

const sh = chart(1990, 8, 1, 9, 0, 121.437, "Asia/Shanghai");
check("Shanghai 1990-08-01 solar time", sh.solar, "07:59");
check("Shanghai 1990-08-01 hour pillar (DST moves it)", sh.hour, "丙辰");

const ny = chart(1988, 7, 15, 14, 30, -73.98, "America/New_York");
check("New York 1988-07-15 solar time", ny.solar, "13:28");
check("New York 1988-07-15 offset (US DST)", ny.b.utcOffsetLabel, "UTC-04:00");

const ur = chart(1990, 7, 1, 12, 0, 87.575, "Asia/Shanghai");
check("Urumqi 1990-07-01 solar time (Beijing clock)", ur.solar, "08:46");
check("Urumqi 1990-07-01 hour pillar", ur.hour, "甲辰");
check("Urumqi day rollover", ur.date, "1990-07-01");

console.log("4. Equation of time extremes (published: about -14.2 min in February, +16.4 min in November)");
function checkNear(label, got, want, tol) {
  const ok = Math.abs(got - want) <= tol;
  if (ok) pass++; else fail++;
  console.log((ok ? "  ok   " : "  FAIL ") + label + (ok ? "" : "   got " + got + ", want " + want + " +/-" + tol));
}
let eotMin = 99, eotMax = -99;
for (let doy = 0; doy < 366; doy++) {
  const v = BaziEngine.equationOfTimeMinutes(Date.UTC(2025, 0, 1) + doy * 86400000);
  if (v < eotMin) eotMin = v;
  if (v > eotMax) eotMax = v;
}
checkNear("annual minimum", eotMin, -14.2, 0.3);
checkNear("annual maximum", eotMax, 16.4, 0.3);

console.log("5. Late zi hour, both schools (1988-06-01 23:30 read directly)");
function lateZi(sect) {
  const ec = Solar.fromYmdHms(1988, 6, 1, 23, 30, 0).getLunar().getEightChar();
  ec.setSect(sect);
  return ec.getDay();
}
check("day pillar stays on the birth day", lateZi(2), "丁亥");
check("day pillar rolls to the next day", lateZi(1), "戊子");

console.log("6. Luck pillars (dayun / liunian / liuyue)");

/* The four pillars on true solar time, as the calculator builds them. */
function eightCharFor(y, mo, d, h, mi, lng, tz, sect) {
  const r = BaziEngine.toTrueSolarTime({ year: y, month: mo, day: d, hour: h, minute: mi, longitude: lng, timezone: tz });
  const s = r.solar;
  const ec = Solar.fromYmdHms(s.year, s.month, s.day, s.hour, s.minute, 0).getLunar().getEightChar();
  ec.setSect(sect === undefined ? 2 : sect);
  return ec;
}

const bjEc = eightCharFor(1988, 6, 1, 12, 0, 116.388, "Asia/Shanghai");
check("1988-06-01 month pillar feeding the luck cycle", bjEc.getMonth(), "丁巳");

/* Yang year (wu) with a male runs forward, so the first pillar is the month pillar +1. */
const maleYun = BaziLuck.build(bjEc, 1, 1);
check("yang year + male runs forward", maleYun.forward, "true");
check("first luck pillar, male", maleYun.daYun[0].ganZhi, "戊午");

/* Yang year with a female runs backward, so it is the month pillar -1. */
const femaleYun = BaziLuck.build(bjEc, 0, 1);
check("yang year + female runs backward", femaleYun.forward, "false");
check("first luck pillar, female", femaleYun.daYun[0].ganZhi, "丙辰");

/* Yin year (ji, 1989) flips the rule. */
const yinEc = eightCharFor(1989, 6, 1, 12, 0, 116.388, "Asia/Shanghai");
check("1989-06-01 year pillar is yin", yinEc.getYear(), "己巳");
check("1989-06-01 month pillar", yinEc.getMonth(), "己巳");
check("yin year + male runs backward", BaziLuck.build(yinEc, 1, 1).forward, "false");
check("first luck pillar, yin year male", BaziLuck.build(yinEc, 1, 1).daYun[0].ganZhi, "戊辰");
check("yin year + female runs forward", BaziLuck.build(yinEc, 0, 1).forward, "true");

/* Every pillar covers ten years and the next one starts the following year. */
let spanOk = true, gapOk = true;
for (let i = 0; i < maleYun.daYun.length; i++) {
  const d = maleYun.daYun[i];
  if (d.endYear - d.startYear !== 9) spanOk = false;
  if (i && d.startYear !== maleYun.daYun[i - 1].endYear + 1) gapOk = false;
}
check("each luck pillar spans ten years", spanOk, "true");
check("luck pillars run on unbroken", gapOk, "true");

/* A liunian must equal the year pillar of that calendar year: 2024 jiachen, 2025 yisi. */
const idx2024 = BaziLuck.indexForYear(maleYun, 2024);
check("2024 sits inside the luck range", idx2024 > -1, "true");
const yearsIn2024 = maleYun.daYun[idx2024].liuNian;
const ln2024 = yearsIn2024.filter((n) => n.year === 2024)[0];
const ln2025 = maleYun.daYun.filter((d) => d.startYear <= 2025 && d.endYear >= 2025)[0].liuNian.filter((n) => n.year === 2025)[0];
check("2024 liunian", ln2024.ganZhi, "甲辰");
check("2025 liunian", ln2025.ganZhi, "乙巳");

/* Liuyue follow the rule "a jia or ji year opens with bingyin in the first month". */
check("2024 first liuyue", ln2024.liuYue[0].ganZhi, "丙寅");
check("2024 second liuyue", ln2024.liuYue[1].ganZhi, "丁卯");
check("2024 twelfth liuyue", ln2024.liuYue[11].ganZhi, "丁丑");
check("twelve months per liunian", ln2024.liuYue.length, 12);

/* The start offset reads as a plain duration. */
check("start offset text", BaziLuck.startText(maleYun), "1 year 5 months");

console.log("");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
