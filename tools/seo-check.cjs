const fs = require("fs"), path = require("path");
const DIST = "dist";
const pages = [];
(function walk(d){ for (const e of fs.readdirSync(d, {withFileTypes:true})) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!/^_astro$/.test(e.name)) walk(p); } else if (e.name.endsWith(".html")) pages.push(p); } })(DIST);
let bad = 0;
for (const p of pages.sort()) {
  const h = fs.readFileSync(p, "utf8");
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const desc = (h.match(/name="description" content="([^"]*)"/) || [])[1] || "";
  const canon = (h.match(/rel="canonical" href="([^"]*)"/) || [])[1] || "";
  const ld = (h.match(/application\/ld\+json/g) || []).length;
  const robots = (h.match(/name="robots" content="([^"]*)"/) || [])[1] || "";
  const og = /property="og:image" content="https:\/\/mystic-destiny\.pages\.dev\/og-default\.png"/.test(h);
  const problems = [];
  if (h1 !== 1) problems.push("h1=" + h1);
  if (title.length > 60) problems.push("title " + title.length);
  if (desc.length > 155) problems.push("desc " + desc.length);
  if (!canon) problems.push("no canonical");
  const isError = /404/.test(p) || /noindex/.test(robots);
  if (!isError && desc.length < 80) problems.push("desc short " + desc.length);
  if (!og) problems.push("og:image");
  if (problems.length) bad++;
  console.log((problems.length ? "  FAIL " : "  ok   ") + p.padEnd(34) + " h1:" + h1 + " ld:" + ld + " t:" + title.length + " d:" + desc.length + (problems.length ? "  <-- " + problems.join(", ") : ""));
}
console.log(bad ? "\n" + bad + " page(s) with issues" : "\nall pages OK");
