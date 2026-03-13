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

- **47 youth basketball drills** organized by focus area, age group, skill level, and player count
- **Filter by player count** — because knowing you have 9 kids tonight changes everything
- **Search by name** for drills you already know
- **Favorites** — star your go-to drills and pull them up instantly
- **AI Drill Generator** — describe what you need and get a custom drill on the spot
- Works on your phone, in the gym, with no login required

---

## Drill library

**Focus areas:**

| Focus | Count |
|---|---|
| Ball Handling | 9 |
| Defense | 9 |
| Shooting | 9 |
| Passing | 8 |
| Footwork | 6 |
| Team Concepts | 5 |
| Conditioning | 1 |

**Age groups:** U8–U10 · U10–U12 · U12–U14 · U14+

**Sources:** Drills are based on content from [Breakthrough Basketball](https://www.breakthroughbasketball.com) and Pro Skills Basketball — cross-referenced against what coaches actually use at the youth level. Staples like the Mikan Drill, Shell Drill, and Form Shooting sit alongside drills like Kill the Grass, Score for Stops, and Red Light Green Light.

---

## Phase 2 (future)

This version is a solid starting point. Here's where I'd like to take it:

- **Expand the drill library** by sourcing more content from vetted coaching resources and organizing it into a proper database
- **Connect a backend** so the drill library can grow continuously without requiring code changes
- **Practice plan builder** — input your time, player count, and focus areas and get a full practice plan generated automatically
- **API key management** so the AI drill generator works for anyone without exposing credentials

Whether or not I get to all of this, the current version solves the immediate problem.

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
