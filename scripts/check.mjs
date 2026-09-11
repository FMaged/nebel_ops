// Mechanische Prüfungen für die Nebel-Lounge-Seite.
// Fängt genau das, was beim Durchklicken unsichtbar bleibt.
// Aufruf: npm run check   (setzt einen Build in _site/ voraus)
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

let failed = 0;
const ok = (n, d = "") => console.log(`  \x1b[32mOK\x1b[0m   ${n}${d && "  " + d}`);
const bad = (n, d) => { failed++; console.log(`  \x1b[31mFAIL\x1b[0m ${n}\n       ${d}`); };

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};
const read = (p) => readFileSync(p, "utf8");

if (!existsSync("_site")) { console.error("Kein _site/ — erst `npm run build`."); process.exit(1); }
const src = walk("src");
const pages = walk("_site").filter((f) => extname(f) === ".html" && !f.includes("/admin/"));

console.log(`\nNebel Lounge — ${pages.length} Seiten\n`);

// 1. Kontaktdaten stehen nur in site.yaml
{
  const hits = src.filter((f) => !f.endsWith("site.yaml") && /4971112345678|Tübinger Straße/.test(read(f)));
  hits.length ? bad("Kontaktdaten nur in site.yaml", hits.join(", ")) : ok("Kontaktdaten nur in site.yaml");
}

// 2. Keine style=""-Attribute im Markup
{
  const hits = src.filter((f) => f.endsWith(".njk") && /\sstyle="/.test(read(f)));
  hits.length ? bad("Keine Inline-Styles", hits.join(", ")) : ok("Keine Inline-Styles");
}

// 3. Feste Farben nur in tokens.css
{
  const hits = src.filter((f) => /\/css\/(?!tokens)/.test(f) && /#[0-9a-fA-F]{3,6}\b|rgba?\(/.test(read(f)));
  hits.length ? bad("Farben nur in tokens.css", hits.join(", ")) : ok("Farben nur in tokens.css");
}

// 4. Jede var()-Referenz ist definiert, keine zeigt auf sich selbst
{
  const css = src.filter((f) => f.endsWith(".css")).map(read).join("\n");
  const defined = new Set([...css.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]));
  const used = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
  const undef = [...used].filter((v) => !defined.has(v));
  const self = [...css.matchAll(/^\s*(--[\w-]+):\s*var\((--[\w-]+)\)/gm)].filter((m) => m[1] === m[2]).map((m) => m[1]);
  undef.length || self.length
    ? bad("CSS-Variablen lösen auf", [...undef.map((v) => v + " undefiniert"), ...self.map((v) => v + " zeigt auf sich selbst")].join(", "))
    : ok("CSS-Variablen lösen auf", `${defined.size} Tokens`);
}

// 5. Keine toten internen Links
{
  const broken = [];
  for (const p of walk("_site").filter((f) => extname(f) === ".html")) {
    for (const m of read(p).matchAll(/(?:href|src)="([^"#:]+)"/g)) {
      const h = m[1];
      if (/^(https?:|mailto:|tel:|\/\/)/.test(h)) continue;
      if (!existsSync(join("_site", h.replace(/^\//, "")))) broken.push(`${p} -> ${h}`);
    }
  }
  broken.length ? bad("Keine toten internen Links", broken.join("\n       ")) : ok("Keine toten internen Links");
}

// 6. Keine doppelten IDs je Seite (Partial zweimal eingebunden)
{
  const dupes = [];
  for (const p of pages) {
    const ids = [...read(p).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const d = [...new Set(ids.filter((i, n) => ids.indexOf(i) !== n))];
    if (d.length) dupes.push(`${p}: ${d.join(", ")}`);
  }
  dupes.length ? bad("Keine doppelten IDs", dupes.join("\n       ")) : ok("Keine doppelten IDs");
}

// 7. Kopfdaten und Zugänglichkeit auf jeder Seite
{
  const need = [
    ["<title>", /<title>[^<]+<\/title>/],
    ["description", /<meta name="description" content="[^"]+"/],
    ["canonical", /<link rel="canonical"/],
    ['lang="de"', /<html lang="de">/],
    ["Sprunglink", /class="skip"/],
    ["genau ein h1", /<h1[\s>]/],
  ];
  const probs = [];
  for (const p of pages) {
    const s = read(p);
    for (const [n, re] of need) if (!re.test(s)) probs.push(`${p}: ${n} fehlt`);
    const h1 = (s.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) probs.push(`${p}: ${h1} h1-Überschriften`);
  }
  probs.length ? bad("Kopfdaten und Zugänglichkeit", probs.join("\n       ")) : ok("Kopfdaten und Zugänglichkeit");
}

// 8. Strukturierte Daten sind gültiges JSON
{
  const probs = [];
  for (const p of pages) {
    const m = read(p).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!m) { probs.push(`${p}: fehlt`); continue; }
    try { JSON.parse(m[1]); } catch (e) { probs.push(`${p}: ${e.message}`); }
  }
  probs.length ? bad("Strukturierte Daten gültig", probs.join("\n       ")) : ok("Strukturierte Daten gültig");
}

// 9. Bilder haben Maße und alt — sonst springt das Layout
{
  const probs = [];
  for (const p of pages)
    for (const m of read(p).matchAll(/<img\s[^>]*>/g)) {
      const t = m[0];
      for (const a of ["width=", "height=", "alt=", "loading="])
        if (!t.includes(a)) probs.push(`${p}: ${a.replace("=", "")} fehlt an ${t.slice(0, 60)}…`);
    }
  probs.length ? bad("Bilder mit Maßen und alt", probs.join("\n       ")) : ok("Bilder mit Maßen und alt");
}

// 10. Das Reveal blendet nur mit JavaScript aus
{
  const eff = read("src/css/effects.css");
  const unguarded = /^\s*\.reveal\s*\{/m.test(eff);
  unguarded
    ? bad("Inhalt ohne JavaScript sichtbar", "ungeschütztes .reveal in effects.css — Inhalt bliebe ohne JS unsichtbar")
    : ok("Inhalt ohne JavaScript sichtbar");
}

// 11. Das CMS verliert beim Speichern keine Felder
{
  const cfg = read("src/admin/config.yml");
  const probs = [];
  for (const f of src.filter((p) => /_data\/(menu|hours|site)\.yaml$/.test(p)))
    for (const m of read(f).matchAll(/^\s*-?\s*([a-zA-Z][\w]*):/gm)) {
      const key = m[1];
      if (!new RegExp(`name:\\s*${key}\\b`).test(cfg)) probs.push(`${key} (${f}) nicht in config.yml`);
    }
  [...new Set(probs)].length
    ? bad("CMS kennt alle Felder", [...new Set(probs)].join("\n       "))
    : ok("CMS kennt alle Felder");
}

console.log(failed ? `\n\x1b[31m${failed} Prüfung(en) fehlgeschlagen\x1b[0m\n` : "\n\x1b[32mAlle Prüfungen bestanden\x1b[0m\n");
process.exit(failed ? 1 : 0);
