# Hoops Index — Drill Library

**Live site:** https://teefrye.github.io/hoops-index-drill-library/

---

## The problem

Coaching youth basketball while working a full-time job is a scheduling puzzle that never fully resolves.

You get to the gym with 15 minutes before practice starts — sometimes less. You need to fill an hour, maybe an hour and a half, with drills that are appropriate for the age group, actually teachable in the time you have, and flexible enough to work whether 8 kids show up or 12. You don't always know which until they walk in the door.

The drills exist. They're scattered across YouTube videos, coaching websites, old notebooks, and things you half-remember from a clinic three years ago. Finding the right one fast — filtered by what you're working on, how many players you have, and what skill level makes sense today — isn't easy when you're standing in a gym parking lot trying to throw together a practice plan.

That's the problem this is trying to solve.

**Hoops Index - Drill Library is a drill index built for the sideline, not the desk.** A fast, filterable, mobile-friendly reference that a coach can pull up between warmups and actually use.

---

## What it does

Hoops Index installs on your phone like a native app (Share → **Add to Home Screen** on iPhone) and works fully offline once installed, so a dead gym signal doesn't matter.

- **116 youth basketball drills** across 10 focus areas, filterable by player count, age group, skill level, length and equipment
- **Practice builder**: pick your time, roster, age and focus and get a full plan (warm-up → skill blocks → water breaks → competitive finisher), then reorder, swap or retime anything
- **Practice Mode**: a sideline timer that runs your plan drill by drill, with coaching cues on screen, whistle beeps, +1 min, and the screen kept awake
- **Saved, Recent and Notes**: star go-to drills and keep your own notes on any drill
- **Share a plan** as text with assistant coaches
- **Backup & restore**, light/dark mode, no login, and all data stays on the device

---

## Drill library

| Focus | Count |
|---|---|
| Ball Handling | 17 |
| Shooting | 15 |
| Passing | 14 |
| Defense | 14 |
| Team Concepts | 13 |
| Finishing | 11 |
| Footwork | 11 |
| Warm-Up | 8 |
| Rebounding | 7 |
| Conditioning | 6 |

**Age groups:** U8–U10 · U10–U12 · U12–U14 · U14+ (each drill lists the youngest group it suits, plus an optional `maxAge` for little-kid games)

All drill write-ups are original. Classic drill concepts (Mikan, Shell, Knockout…) are common coaching knowledge, but the descriptions are written for this app rather than copied from other sites.

---

## Adding drills

1. Copy `content/example-new-drills.json` to a new file and fill in one or more drills (no `id` needed).
2. Run `npm run drills:add -- content/your-file.json`. This validates every field, assigns ids, and skips duplicates by name.
3. `npm run drills:check` validates the whole library (the build runs it automatically).

**Schema:**
```json
{
  "name": "Drill Name",
  "focus": "Warm-Up | Ball Handling | Passing | Shooting | Finishing | Footwork | Defense | Rebounding | Team Concepts | Conditioning",
  "ageGroup": "U8–U10 | U10–U12 | U12–U14 | U14+",
  "maxAge": "optional, oldest age group it suits",
  "skill": "Beginner | Intermediate | Advanced",
  "duration": 10,
  "minPlayers": 1,
  "maxPlayers": 10,
  "equipment": ["optional", "list"],
  "competitive": true,
  "setup": "What you need and how to set it up.",
  "steps": ["Step 1", "Step 2"],
  "cues": ["Coaching cue"],
  "variations": ["Variation"]
}
```

---

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # validate drills, type-check, build to dist/
npm run preview   # serve the production build
```

- **Stack:** React + TypeScript + Vite, `vite-plugin-pwa` for the offline service worker and install manifest
- **Data:** `src/data/drills.json`, bundled into the app so it works offline
- **Storage:** `localStorage` (favorites, practices, notes, settings)
- **Hosting:** GitHub Pages, deployed by `.github/workflows/deploy.yml` on every push to `main`
- `legacy/index.html` is the original v1 single-file app, kept for reference

---

## Roadmap

- **App Store:** wrap with Capacitor (the codebase is already set up for it); needs the $99/yr Apple Developer Program
- **AI drill generator:** brought back behind a small server-side proxy so the API key stays private
- **Court diagrams** for each drill
- **Cloud sync** so plans follow you across devices and coaches on the same team can share them
