#!/usr/bin/env node
// Validate the drill library, and optionally merge new drills into it.
//
//   node scripts/drills.mjs check
//   node scripts/drills.mjs add content/my-new-drills.json [...more files]
//
// New-drill files are a JSON array of drill objects without an "id";
// ids are assigned automatically and duplicates (by name) are skipped.
import { readFileSync, writeFileSync } from "node:fs";

const DB = new URL("../src/data/drills.json", import.meta.url);
const FOCUS = ["Warm-Up", "Ball Handling", "Passing", "Shooting", "Finishing", "Footwork", "Defense", "Rebounding", "Team Concepts", "Conditioning"];
const AGES = ["U8–U10", "U10–U12", "U12–U14", "U14+"];
const SKILLS = ["Beginner", "Intermediate", "Advanced"];

function validate(d, where) {
  const errs = [];
  const need = (cond, msg) => cond || errs.push(`${where} "${d.name ?? "?"}": ${msg}`);
  need(typeof d.name === "string" && d.name.trim(), "name is required");
  need(FOCUS.includes(d.focus), `focus must be one of ${FOCUS.join(", ")}`);
  need(AGES.includes(d.ageGroup), `ageGroup must be one of ${AGES.join(", ")}`);
  need(d.maxAge === undefined || (AGES.includes(d.maxAge) && AGES.indexOf(d.maxAge) >= AGES.indexOf(d.ageGroup)), "maxAge must be an age group at or above ageGroup");
  need(SKILLS.includes(d.skill), `skill must be one of ${SKILLS.join(", ")}`);
  need(Number.isInteger(d.duration) && d.duration > 0 && d.duration <= 60, "duration must be 1–60 minutes");
  need(Number.isInteger(d.minPlayers) && d.minPlayers >= 1, "minPlayers must be ≥ 1");
  need(Number.isInteger(d.maxPlayers) && d.maxPlayers >= d.minPlayers, "maxPlayers must be ≥ minPlayers");
  need(typeof d.setup === "string" && d.setup.trim(), "setup is required");
  for (const k of ["steps", "cues", "variations"]) need(Array.isArray(d[k]) && d[k].every((s) => typeof s === "string" && s.trim()), `${k} must be a list of strings`);
  need(d.steps?.length >= 2, "needs at least 2 steps");
  need(d.equipment === undefined || (Array.isArray(d.equipment) && d.equipment.every((s) => typeof s === "string")), "equipment must be a list of strings");
  need(d.competitive === undefined || typeof d.competitive === "boolean", "competitive must be true/false");
  return errs;
}

const db = JSON.parse(readFileSync(DB, "utf8"));
const [cmd, ...files] = process.argv.slice(2);
const key = (n) => n.toLowerCase().replace(/[^a-z0-9]/g, "");

if (cmd === "add") {
  if (!files.length) throw new Error("Usage: node scripts/drills.mjs add <file.json> [...]");
  const names = new Set(db.drills.map((d) => key(d.name)));
  let nextId = Math.max(...db.drills.map((d) => Number(d.id) || 0)) + 1;
  let added = 0;
  const errors = [];
  for (const f of files) {
    const incoming = JSON.parse(readFileSync(f, "utf8"));
    for (const d of incoming) {
      const e = validate(d, f);
      if (e.length) { errors.push(...e); continue; }
      if (names.has(key(d.name))) { console.log(`skip (already exists): ${d.name}`); continue; }
      names.add(key(d.name));
      db.drills.push({ id: nextId++, ...d });
      added++;
    }
  }
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  writeFileSync(DB, JSON.stringify(db, null, 2) + "\n");
  console.log(`Added ${added} drills. Library now has ${db.drills.length}.`);
} else if (cmd === "check" || !cmd) {
  const errors = db.drills.flatMap((d) => validate(d, `#${d.id}`));
  const ids = db.drills.map((d) => d.id);
  if (new Set(ids).size !== ids.length) errors.push("Duplicate ids found");
  const names = db.drills.map((d) => key(d.name));
  if (new Set(names).size !== names.length) errors.push("Duplicate drill names found");
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  const by = (k) => Object.entries(db.drills.reduce((a, d) => ((a[d[k]] = (a[d[k]] ?? 0) + 1), a), {})).map(([n, c]) => `${n}: ${c}`).join(" · ");
  console.log(`✓ ${db.drills.length} drills valid\n  ${by("focus")}\n  ${by("ageGroup")}\n  ${by("skill")}`);
} else {
  throw new Error(`Unknown command ${cmd}`);
}
