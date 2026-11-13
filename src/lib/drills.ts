import { AGE_GROUPS, FOCUS_AREAS, SKILLS, type AgeGroup, type Drill, type Focus, type Skill } from "../types";

export const ageIndex = (a: AgeGroup) => AGE_GROUPS.indexOf(a);

/** Does the drill suit this age group? A drill suits from its ageGroup up to maxAge (default U14+). */
export function suitsAge(d: Drill, age: AgeGroup) {
  const i = ageIndex(age);
  return ageIndex(d.ageGroup) <= i && i <= ageIndex(d.maxAge ?? "U14+");
}

export const suitsPlayers = (d: Drill, n: number) => d.minPlayers <= n && d.maxPlayers >= n;

export interface DrillFilters {
  query: string;
  focus: Focus[];
  age: AgeGroup | null;
  skill: Skill[];
  players: number | null;
  maxMinutes: number | null;
  noEquipment: boolean;
}

export const EMPTY_FILTERS: DrillFilters = {
  query: "",
  focus: [],
  age: null,
  skill: [],
  players: null,
  maxMinutes: null,
  noEquipment: false,
};

export function activeFilterCount(f: DrillFilters) {
  return (f.age ? 1 : 0) + f.skill.length + (f.players ? 1 : 0) + (f.maxMinutes ? 1 : 0) + (f.noEquipment ? 1 : 0);
}

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, "");

export function filterDrills(drills: Drill[], f: DrillFilters) {
  const q = norm(f.query.trim());
  const scored: { d: Drill; s: number }[] = [];
  for (const d of drills) {
    if (f.focus.length && !f.focus.includes(d.focus)) continue;
    if (f.age && !suitsAge(d, f.age)) continue;
    if (f.skill.length && !f.skill.includes(d.skill)) continue;
    if (f.players && !suitsPlayers(d, f.players)) continue;
    if (f.maxMinutes && d.duration > f.maxMinutes) continue;
    if (f.noEquipment && d.equipment?.some((e) => !/^(basketballs?|hoop|ball)$/i.test(e))) continue;
    let s = 0;
    if (q) {
      const name = norm(d.name);
      if (name.startsWith(q)) s = 3;
      else if (name.includes(q)) s = 2;
      else if (norm([d.focus, d.setup, ...d.steps, ...d.cues].join(" ")).includes(q)) s = 1;
      else continue;
    }
    scored.push({ d, s });
  }
  return scored
    .sort((a, b) => b.s - a.s || FOCUS_AREAS.indexOf(a.d.focus) - FOCUS_AREAS.indexOf(b.d.focus) || SKILLS.indexOf(a.d.skill) - SKILLS.indexOf(b.d.skill) || a.d.name.localeCompare(b.d.name))
    .map((x) => x.d);
}

export function playersLabel(d: Drill) {
  if (d.maxPlayers >= 30) return `${d.minPlayers}+`;
  return d.minPlayers === d.maxPlayers ? `${d.minPlayers}` : `${d.minPlayers}–${d.maxPlayers}`;
}

export function ageLabel(d: Drill) {
  const max = d.maxAge ?? "U14+";
  if (max === d.ageGroup) return d.ageGroup;
  if (max === "U14+") return `${d.ageGroup.split("–")[0]}+`;
  return `${d.ageGroup.split("–")[0]}–${max.split("–")[1]}`;
}

export function formatMinutes(m: number) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} hr ${r} min` : `${h} hr`;
}

export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
