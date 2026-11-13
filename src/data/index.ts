import raw from "./drills.json";
import type { Drill } from "../types";

export const DRILLS: Drill[] = (raw as { drills: Drill[] }).drills;

const byId = new Map(DRILLS.map((d) => [String(d.id), d]));
export const getDrill = (id: Drill["id"]) => byId.get(String(id));
