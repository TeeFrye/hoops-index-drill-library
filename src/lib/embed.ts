import { plansStore, savePlan, settingsStore, uid } from "../store";
import { generatePlan } from "./generator";
import type { ThemePref } from "../types";

/**
 * Embed mode: for showing the live app inside another site (e.g. a portfolio
 * case study in a phone frame).
 *
 *   https://teefrye.github.io/hoops-index-drill-library/?embed
 *   https://teefrye.github.io/hoops-index-drill-library/?embed&theme=dark
 *
 * Also switches on automatically when the app is loaded inside an <iframe>.
 * In embed mode the install prompts are hidden, the offline service worker is
 * skipped (so the embed always shows the latest version), and a sample
 * practice is added if the visitor has none.
 */
const params = new URLSearchParams(location.search);

const inIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true; // cross-origin parent
  }
})();

export const isEmbed = params.has("embed") || inIframe;

/** Theme forced by the embedding page (?theme=light|dark); never saved to settings. */
export const embedTheme: ThemePref | null = (() => {
  const t = params.get("theme");
  return t === "light" || t === "dark" ? t : null;
})();

export function setupEmbed() {
  if (!isEmbed) return;
  document.documentElement.classList.add("embed");
  if (plansStore.get().length === 0) {
    const s = settingsStore.get();
    const input = {
      minutes: 60,
      players: s.players,
      ageGroup: s.ageGroup,
      skill: "Beginner" as const,
      focus: ["Ball Handling", "Shooting"] as ("Ball Handling" | "Shooting")[],
      conditioning: false,
      waterBreaks: true,
    };
    savePlan({
      id: uid(),
      name: "Handles + Shooting",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      players: s.players,
      ageGroup: s.ageGroup,
      items: generatePlan(input),
    });
  }
}
