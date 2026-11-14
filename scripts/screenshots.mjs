#!/usr/bin/env node
// Captures marketing screenshots of the app at iPhone size (390×844 @3x),
// in light and dark mode, plus phone-framed versions and a 4-up showcase.
//
//   npm run build && npm run preview      # in one terminal
//   npm run screenshots                   # in another
//
// Options (env vars):
//   SHOTS_URL   app URL (default: local preview server)
//   SHOTS_OUT   output folder (default: ./screenshots, git-ignored)
//   CHROME_PATH Chrome/Chromium binary (default: macOS Google Chrome)
//
// Uses your installed Chrome via puppeteer-core (no browser download).
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const URL_BASE = process.env.SHOTS_URL ?? "http://localhost:4173/hoops-index-drill-library/";
const OUT = resolve(process.env.SHOTS_OUT ?? "screenshots");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const W = 390;
const H = 844;
const DPR = 3;

// A fixed, realistic 60-minute practice so every run produces the same screens.
const DEMO_PLAN = {
  id: "demo-plan",
  name: "Handles + Shooting",
  createdAt: 1763000000000,
  updatedAt: 1763000000000,
  players: 10,
  ageGroup: "U10–U12",
  items: [
    ["Layup Line Warm-Up", 7],
    ["Stationary Pound Series", 6],
    ["Form Shooting", 10],
    ["break", 2],
    ["Zig-Zag Change of Direction", 8],
    ["Catch & Shoot Footwork", 9],
    ["Partner Shooting Race", 6],
    ["Fast Break 2-on-1", 12],
  ],
};

/* iOS-style status bar + home indicator, drawn into the page so screenshots look native. */
const CHROME_OVERLAY = `
  html:root { --safe-top: 47px; --safe-bottom: 34px; }
  #fake-status { position: fixed; z-index: 99999; top: 0; left: 0; right: 0; height: 47px; pointer-events: none;
    display: flex; align-items: center; justify-content: space-between; padding: 6px 30px 0 44px; color: #fff;
    font: 600 17px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif; letter-spacing: -0.01em; }
  #fake-status .r { display: flex; gap: 6px; align-items: center; }
  #fake-home { position: fixed; z-index: 99999; bottom: 8px; left: 50%; width: 134px; height: 5px; margin-left: -67px;
    border-radius: 3px; background: rgba(255,255,255,.9); pointer-events: none; }
`;
const STATUS_HTML = `<span>9:41</span><span class="r">
  <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
  <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff"><path d="M8 2.6c2.2 0 4.2.9 5.7 2.3l1.1-1.1A9.6 9.6 0 0 0 8 1 9.6 9.6 0 0 0 1.2 3.8l1.1 1.1A8 8 0 0 1 8 2.6zm0 3.2c1.3 0 2.5.5 3.4 1.3l1.1-1.1A6.4 6.4 0 0 0 8 4.2c-1.7 0-3.3.7-4.5 1.8l1.1 1.1c.9-.8 2.1-1.3 3.4-1.3zM8 9l1.9 1.9L8 12.8 6.1 10.9z"/></svg>
  <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#fff" stroke-opacity=".45"/><rect x="2" y="2" width="20" height="9" rx="2" fill="#fff"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="#fff" fill-opacity=".45"/></svg>
</span>`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function capture(theme) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars"] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });

  // Seed deterministic data before the app boots.
  const { default: data } = await import(new URL("../src/data/drills.json", import.meta.url), { with: { type: "json" } });
  const byName = new Map(data.drills.map((d) => [d.name, d.id]));
  const plan = {
    ...DEMO_PLAN,
    items: DEMO_PLAN.items.map(([name, minutes], i) =>
      name === "break"
        ? { key: `k${i}`, type: "break", label: "Water break", minutes }
        : { key: `k${i}`, type: "drill", drillId: byName.get(name) ?? (() => { throw new Error(`No drill named ${name}`); })(), minutes },
    ),
  };
  const favorites = ["Euro Step Progression", "Form Shooting", "Shell Drill"].map((n) => String(byName.get(n)));
  await page.evaluateOnNewDocument(
    (plan, favorites) => {
      localStorage.setItem("hi.plans", JSON.stringify([plan]));
      localStorage.setItem("hi.favorites", JSON.stringify(favorites));
      localStorage.setItem("hi.settings", JSON.stringify({ theme: "system", players: 10, ageGroup: "U10–U12", sound: false }));
    },
    plan,
    favorites,
  );

  await page.goto(`${URL_BASE}?embed&theme=${theme}`, { waitUntil: "networkidle0" });
  await page.addStyleTag({ content: CHROME_OVERLAY });
  await page.evaluate((html) => {
    const s = document.createElement("div");
    s.id = "fake-status";
    s.innerHTML = html;
    const h = document.createElement("div");
    h.id = "fake-home";
    document.body.append(s, h);
  }, STATUS_HTML);
  await page.evaluate(() => document.fonts.ready);
  await sleep(900); // banner drop-in animation

  const dir = join(OUT, "raw", theme);
  mkdirSync(dir, { recursive: true });
  const shots = [];
  const shoot = async (name) => {
    const file = join(dir, `${name}.png`);
    await page.screenshot({ path: file });
    shots.push(file);
    console.log("  ✓", theme, name);
  };
  const click = (fn) => page.evaluate(fn);

  // 1. Drills home
  await shoot("01-drills");

  // 2. Drill detail
  await click(() => [...document.querySelectorAll(".drill-card")].find((c) => c.textContent.includes("Euro Step Progression"))?.click());
  await sleep(200);
  if (!(await page.$(".drill-hero"))) {
    // Not in the first screenful: search for it instead.
    await page.type(".search input", "Euro Step");
    await sleep(300);
    await click(() => document.querySelector(".drill-card")?.click());
  }
  await sleep(700);
  await shoot("02-drill-detail");

  // 3. Build-a-practice sheet
  await click(() => document.querySelectorAll(".tab")[1].click());
  await sleep(400);
  await click(() => document.querySelector(".cta").click());
  await sleep(800);
  await shoot("03-build-practice");
  await click(() => document.querySelector(".sheet-backdrop").click());
  await sleep(500);

  // 4. Practice plan
  await click(() => document.querySelector(".plan-card").click());
  await sleep(700);
  await shoot("04-practice-plan");

  // 5. Practice Mode, clock running
  await click(() => [...document.querySelectorAll(".action-bar .btn")].find((b) => b.textContent.includes("Start"))?.click());
  await sleep(700);
  await click(() => document.querySelector('.practice [aria-label="Start"]').click());
  await sleep(2300);
  await shoot("05-practice-mode");

  // 6. Practice complete
  for (let i = 0; i < 12; i++) {
    const done = await click(() => {
      const b = document.querySelector('.practice [aria-label="Next"]');
      b?.click();
      return !b;
    });
    if (done) break;
    await sleep(80);
  }
  await sleep(1300);
  await shoot("06-practice-complete");

  await browser.close();
  return shots;
}

/* ---------- Phone frames ---------- */
const SW = W * DPR; // 1170
const SH = H * DPR; // 2532
const BEZEL = 42;
const R_SCREEN = 150;
const FW = SW + BEZEL * 2;
const FH = SH + BEZEL * 2;

async function frame(file, outFile) {
  const mask = Buffer.from(`<svg width="${SW}" height="${SH}"><rect width="${SW}" height="${SH}" rx="${R_SCREEN}" fill="#fff"/></svg>`);
  const screen = await sharp(file).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const body = Buffer.from(`<svg width="${FW}" height="${FH}">
    <rect x="0" y="0" width="${FW}" height="${FH}" rx="${R_SCREEN + BEZEL}" fill="#141414"/>
    <rect x="3" y="3" width="${FW - 6}" height="${FH - 6}" rx="${R_SCREEN + BEZEL - 3}" fill="none" stroke="#3a3a3a" stroke-width="4"/>
  </svg>`);
  // Dynamic Island
  const island = Buffer.from(`<svg width="${FW}" height="${FH}"><rect x="${FW / 2 - 186}" y="${BEZEL + 33}" width="372" height="111" rx="55.5" fill="#000"/></svg>`);
  await sharp(body)
    .composite([{ input: screen, left: BEZEL, top: BEZEL }, { input: island }])
    .png({ compressionLevel: 9 })
    .toFile(outFile);
  return outFile;
}

async function showcase(framed, outFile) {
  const scale = 0.5;
  const pw = Math.round(FW * scale);
  const ph = Math.round(FH * scale);
  const gap = 90;
  const pad = 80;
  const cw = pad * 2 + pw * framed.length + gap * (framed.length - 1);
  const ch = pad * 2 + ph;
  const phones = await Promise.all(framed.map((f) => sharp(f).resize(pw, ph).png().toBuffer()));
  await sharp({ create: { width: cw, height: ch, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(phones.map((input, i) => ({ input, left: pad + i * (pw + gap), top: pad })))
    .png({ compressionLevel: 9 })
    .toFile(outFile);
}

console.log(`Capturing ${URL_BASE} → ${OUT}`);
for (const theme of ["light", "dark"]) {
  const raw = await capture(theme);
  const framedDir = join(OUT, "framed", theme);
  mkdirSync(framedDir, { recursive: true });
  const framed = [];
  for (const f of raw) framed.push(await frame(f, join(framedDir, f.split("/").pop())));
  // The core story in four phones: browse → build → plan → run.
  const pick = (n) => framed.find((f) => f.includes(n));
  await showcase([pick("01-"), pick("03-"), pick("04-"), pick("05-")], join(OUT, `showcase-${theme}.png`));
  console.log("  ✓", theme, "frames + showcase");
}
console.log("Done.");
