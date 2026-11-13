export const FOCUS_AREAS = [
  "Warm-Up",
  "Ball Handling",
  "Passing",
  "Shooting",
  "Finishing",
  "Footwork",
  "Defense",
  "Rebounding",
  "Team Concepts",
  "Conditioning",
] as const;
export type Focus = (typeof FOCUS_AREAS)[number];

export const AGE_GROUPS = ["U8–U10", "U10–U12", "U12–U14", "U14+"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const SKILLS = ["Beginner", "Intermediate", "Advanced"] as const;
export type Skill = (typeof SKILLS)[number];

export interface Drill {
  id: number | string;
  name: string;
  focus: Focus;
  /** Youngest age group the drill suits. */
  ageGroup: AgeGroup;
  /** Oldest age group the drill suits (defaults to U14+). */
  maxAge?: AgeGroup;
  skill: Skill;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  equipment?: string[];
  competitive?: boolean;
  setup: string;
  steps: string[];
  cues: string[];
  variations: string[];
}

export type PlanItem =
  | { key: string; type: "drill"; drillId: Drill["id"]; minutes: number }
  | { key: string; type: "break"; label: string; minutes: number };

export interface Plan {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  players?: number;
  ageGroup?: AgeGroup;
  items: PlanItem[];
}

export type ThemePref = "system" | "light" | "dark";

export interface Settings {
  theme: ThemePref;
  players: number;
  ageGroup: AgeGroup;
  sound: boolean;
}
