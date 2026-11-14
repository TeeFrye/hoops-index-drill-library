#!/usr/bin/env node
// Generates public/og-image.png: the 1200×630 link-preview card shown when the
// app's URL is shared (iMessage, LinkedIn, Slack, X…).
//
//   npm run og
//
// Text is converted to vector paths with opentype.js using the app's display
// font (Barlow Condensed), so the image doesn't depend on fonts installed on
// the machine that runs this script.
import { readFileSync } from "node:fs";
import opentype from "opentype.js";
import sharp from "sharp";

const root = new URL("..", import.meta.url);
const fontFile = (w) => new URL(`node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-${w}-normal.woff`, root);
const load = (w) => {
  const buf = readFileSync(fontFile(w));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const F800 = load(800);
const F600 = load(600);

const W = 1200;
const H = 630;
const CRIMSON = "#9d0d14";
const CREAM = "#fbf6ee";

/** Path commands → SVG `d`. (opentype.js's own toPathData(n) emits NaN for some coordinates.) */
const n = (v) => (Math.round(v * 100) / 100).toString();
function toD(commands) {
  return commands
    .map((c) => {
      switch (c.type) {
        case "M":
        case "L":
          return `${c.type}${n(c.x)} ${n(c.y)}`;
        case "Q":
          return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case "C":
          return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        default:
          return "Z";
      }
    })
    .join("");
}

/** Text → SVG path. `spacing` is letter-spacing in em. anchor: start | middle. */
function text(str, font, size, x, y, { spacing = 0, anchor = "start", fill = CREAM, opacity = 1 } = {}) {
  // Glyphs are laid out one by one (no kerning): simple, predictable spacing.
  const scale = size / font.unitsPerEm;
  const glyphs = [...str].map((ch) => font.charToGlyph(ch));
  const advance = (g) => g.advanceWidth * scale + spacing * size;
  const width = glyphs.reduce((w, g) => w + advance(g), 0) - spacing * size;
  let cx = anchor === "middle" ? x - width / 2 : x;
  const parts = glyphs.map((g) => {
    const d = toD(g.getPath(cx, y, size).commands);
    cx += advance(g);
    return d;
  });
  return `<path d="${parts.join("")}" fill="${fill}" fill-opacity="${opacity}"/>`;
}

/** A hanging championship-style banner with a big number and a label. */
function banner(cx, top, big, label1, label2) {
  const w = 132;
  const h = 236;
  const x = cx - w / 2;
  return `
  <g>
    <line x1="${x + 26}" y1="${top - 26}" x2="${x + 26}" y2="${top}" stroke="${CREAM}" stroke-opacity=".55" stroke-width="2"/>
    <line x1="${x + w - 26}" y1="${top - 26}" x2="${x + w - 26}" y2="${top}" stroke="${CREAM}" stroke-opacity=".55" stroke-width="2"/>
    <path d="M${x} ${top}H${x + w}V${top + h}L${cx} ${top + h - 26}L${x} ${top + h}Z" fill="${CREAM}" filter="url(#shadow)"/>
    <rect x="${x}" y="${top}" width="${w}" height="14" fill="url(#stripeSmall)"/>
    <path d="M${x + 9} ${top + 24}H${x + w - 9}V${top + h - 12}L${cx} ${top + h - 36}L${x + 9} ${top + h - 12}Z" fill="none" stroke="${CRIMSON}" stroke-opacity=".45" stroke-width="2"/>
    ${text(big, F800, 64, cx, top + 112, { anchor: "middle", fill: CRIMSON })}
    ${text(label1, F800, 24, cx, top + 150, { anchor: "middle", fill: CRIMSON, spacing: 0.06 })}
    ${label2 ? text(label2, F800, 24, cx, top + 176, { anchor: "middle", fill: CRIMSON, spacing: 0.06 }) : ""}
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b3141c"/>
      <stop offset="1" stop-color="#7a0a10"/>
    </linearGradient>
    <pattern id="stripe" width="36" height="36" patternUnits="userSpaceOnUse">
      <rect width="18" height="36" fill="${CRIMSON}"/>
      <rect x="18" width="18" height="36" fill="${CREAM}"/>
    </pattern>
    <pattern id="stripeSmall" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="6" height="12" fill="${CRIMSON}"/>
      <rect x="6" width="6" height="12" fill="${CREAM}"/>
    </pattern>
    <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#2a0003" flood-opacity=".45"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- candy-stripe band -->
  <rect y="${H - 64}" width="${W}" height="64" fill="url(#stripe)"/>
  <rect y="${H - 72}" width="${W}" height="8" fill="${CREAM}"/>

  <!-- copy -->
  ${text("HOOPS INDEX", F800, 128, 72, 338, { spacing: 0.01 })}
  ${text("DRILLS · PRACTICE PLANS · SIDELINE TIMER", F800, 34, 76, 398, { spacing: 0.08, opacity: 0.92 })}
  ${text("Free youth basketball app. Works offline. No account.", F600, 30, 76, 452, { opacity: 0.75 })}

  <!-- rafter + banners -->
  <line x1="790" y1="66" x2="${W}" y2="66" stroke="${CREAM}" stroke-opacity=".35" stroke-width="4"/>
  ${banner(862, 92, "116", "DRILLS")}
  ${banner(1012, 92, "10", "FOCUS", "AREAS")}
</svg>`;

const icon = await sharp(new URL("public/pwa-512x512.png", root).pathname).resize(124, 124).png().toBuffer();

await sharp(Buffer.from(svg))
  .composite([{ input: icon, left: 76, top: 92 }])
  .png({ compressionLevel: 9 })
  .toFile(new URL("public/og-image.png", root).pathname);

console.log("✓ public/og-image.png (1200×630)");
