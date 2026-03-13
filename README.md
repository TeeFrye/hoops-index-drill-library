# Hoops Index — Drill Library

**Live site:** https://teefrye.github.io/hoops-index-drill-library/

---

## What this is

A personal coaching tool and shareable resource for youth basketball coaches. Browse, filter, and search 47 practice drills organized by focus area, age group, skill level, and player count. Includes an AI-powered drill generator that creates custom drills based on what you need.

Built for my own use coaching youth basketball — shared publicly because every coach should have access to a clean, organized drill library.

---

## Drill library

**47 drills** across 7 focus areas:

| Focus | Count |
|---|---|
| Ball Handling | 9 |
| Defense | 9 |
| Shooting | 9 |
| Passing | 8 |
| Footwork | 6 |
| Team Concepts | 5 |
| Conditioning | 1 |

**Age groups covered:** U8–U10 · U10–U12 · U12–U14 · U14+

**Sources:** Drills are based on content from [Breakthrough Basketball](https://www.breakthroughbasketball.com), Pro Skills Basketball, and Basketball for Coaches — cross-referenced against what coaches actually use at the youth level. Staples like the Mikan Drill, Shell Drill, 3-Man Weave, and Form Shooting are in here alongside less obvious drills like Kill the Grass, Red Light Green Light, and Score for Stops.

---

## Features

- **Filter** by focus, age group, skill level, and player count
- **Search** by drill name
- **Favorites** — star any drill and access them in the Saved tab
- **AI Drill Generator** — describe what you need and get a custom drill built on the spot (uses Claude API)
- **Dark / Light mode** toggle
- Drill detail view with setup, steps, coaching cues, and variations

---

## How it's built

- **Stack:** Single-file HTML using React (via CDN) + Babel standalone — no build tools, no npm
- **Data:** `drills.json` in the repo root — plain JSON, editable in any text editor
- **AI:** Claude API (`claude-sonnet-4-20250514`) for the drill generator
- **Hosting:** GitHub Pages
- **Storage:** `localStorage` for favorites, AI-generated drills, and theme preference

---

## Adding or editing drills

All drills live in `drills.json`. To add a drill, copy any existing drill object, assign a new unique `id`, edit the fields, and commit. No code changes needed.

**Schema:**

```json
{
  "id": 48,
  "name": "Drill Name",
  "focus": "Ball Handling | Passing | Shooting | Defense | Footwork | Conditioning | Team Concepts",
  "ageGroup": "U8–U10 | U10–U12 | U12–U14 | U14+",
  "skill": "Beginner | Intermediate | Advanced",
  "duration": 10,
  "minPlayers": 1,
  "maxPlayers": 10,
  "setup": "What you need and how to set it up.",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "cues": ["Coaching cue 1", "Coaching cue 2"],
  "variations": ["Variation 1", "Variation 2"]
}
```

---

## File structure

```
hoops-index-drill-library/
├── index.html    ← the entire app
├── drills.json   ← all drill data
└── README.md
```

---
