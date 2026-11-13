import { DRILLS } from "../data";
import { SKILLS, type AgeGroup, type Drill, type Focus, type PlanItem, type Skill } from "../types";
import { uid } from "../store";
import { suitsAge, suitsPlayers } from "./drills";

export interface GeneratorInput {
  minutes: number;
  players: number;
  ageGroup: AgeGroup;
  skill: Skill;
  focus: Focus[];
  conditioning: boolean;
  waterBreaks: boolean;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Builds a practice: warm-up → focus skill blocks (rotating through the chosen
 * focus areas) → optional conditioning → competitive team finisher, with water
 * breaks roughly every 25 minutes. Randomised so "Shuffle" gives a fresh plan.
 */
export function generatePlan(input: GeneratorInput): PlanItem[] {
  const { minutes, players, ageGroup, skill, conditioning, waterBreaks } = input;
  const focus: Focus[] = input.focus.length ? input.focus : ["Ball Handling", "Shooting", "Defense"];
  const maxSkill = SKILLS.indexOf(skill);

  let pool = DRILLS.filter((d) => suitsAge(d, ageGroup) && suitsPlayers(d, players) && SKILLS.indexOf(d.skill) <= maxSkill);
  // Small or unusual rosters: relax the max-player limit (most drills scale with lines).
  if (pool.length < 15) pool = DRILLS.filter((d) => suitsAge(d, ageGroup) && d.minPlayers <= players && SKILLS.indexOf(d.skill) <= maxSkill);

  const used = new Set<string>();
  const pick = (pred: (d: Drill) => boolean): Drill | undefined => {
    const options = pool.filter((d) => !used.has(String(d.id)) && pred(d));
    if (!options.length) return undefined;
    // Weight towards drills that match the chosen skill level exactly.
    const weights = options.map((d) => (d.skill === skill ? 3 : 1));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    const chosen = options.find((_, i) => (r -= weights[i]) <= 0) ?? options[0];
    used.add(String(chosen.id));
    return chosen;
  };

  const item = (d: Drill, m: number): PlanItem => ({ key: uid(), type: "drill", drillId: d.id, minutes: m });
  const breakItem = (): PlanItem => ({ key: uid(), type: "break", label: "Water break", minutes: 2 });

  // --- Budget ---
  const breakCount = waterBreaks ? Math.max(0, Math.floor(minutes / 30)) : 0;
  const warmupMin = clamp(Math.round(minutes * 0.12), 5, 10);
  const finisherMin = clamp(Math.round(minutes * 0.22), 8, 20);
  const condMin = conditioning ? clamp(Math.round(minutes * 0.08), 4, 8) : 0;
  let skillBudget = minutes - warmupMin - finisherMin - condMin - breakCount * 2;

  const warm = pick((d) => d.focus === "Warm-Up") ?? pick((d) => d.focus === "Ball Handling" && d.skill === "Beginner") ?? pick(() => true);

  // --- Skill blocks, rotating through focus areas ---
  const blocks: PlanItem[] = [];
  let fi = 0;
  let misses = 0;
  while (skillBudget >= 5 && misses < focus.length * 2) {
    const f = focus[fi % focus.length];
    fi++;
    const d = pick((x) => x.focus === f && !x.competitive) ?? pick((x) => x.focus === f);
    if (!d) {
      misses++;
      continue;
    }
    misses = 0;
    let m = clamp(d.duration, 6, 15);
    if (skillBudget - m < 5) m = skillBudget; // absorb the remainder
    m = Math.min(m, skillBudget);
    blocks.push(item(d, m));
    skillBudget -= m;
  }
  if (skillBudget > 0 && blocks.length) blocks[blocks.length - 1].minutes += skillBudget;

  const cond = conditioning ? pick((d) => d.focus === "Conditioning") : undefined;
  const finisher =
    pick((d) => d.focus === "Team Concepts" && !!d.competitive) ??
    pick((d) => d.focus === "Team Concepts") ??
    pick((d) => !!d.competitive);

  // --- Assemble, inserting water breaks every ~25 minutes of work ---
  const ordered: PlanItem[] = [];
  if (warm) ordered.push(item(warm, warmupMin));
  ordered.push(...blocks);
  if (cond) ordered.push(item(cond, condMin));
  if (finisher) ordered.push(item(finisher, finisherMin));

  // If anything could not be filled, give the time to the finisher / last block.
  const assigned = ordered.reduce((a, b) => a + b.minutes, 0) + breakCount * 2;
  if (assigned < minutes && ordered.length) ordered[ordered.length - 1].minutes += minutes - assigned;

  const out: PlanItem[] = [];
  let sinceBreak = 0;
  let breaksLeft = breakCount;
  ordered.forEach((it, i) => {
    if (breaksLeft > 0 && sinceBreak >= 22 && i < ordered.length) {
      out.push(breakItem());
      breaksLeft--;
      sinceBreak = 0;
    }
    out.push(it);
    sinceBreak += it.minutes;
  });
  // Any breaks we couldn't place (very short plans) — return their time to the last drill.
  if (breaksLeft > 0) {
    const last = [...out].reverse().find((x) => x.type === "drill");
    if (last) last.minutes += breaksLeft * 2;
  }
  return out;
}

export function defaultPlanName(input: Pick<GeneratorInput, "focus" | "minutes">) {
  const f = input.focus.length ? input.focus.slice(0, 2).join(" + ") : "Balanced";
  return `${f} · ${input.minutes} min`;
}
