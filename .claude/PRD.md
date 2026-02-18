# Fantasy Olympics Tracker — Product Requirements Document

## Overview

A web app for a friend group to view, explore, and compare their Fantasy Olympics results across multiple Olympic Games. The app supports per-game team breakdowns, daily medal tracking, historical graphs, and an all-time leaderboard.

---

## Background & Context

The group has participated in Fantasy Olympics across multiple Games, starting from **Rio 2016** through **Milano Cortina 2026**. Each participant:
- Drafts one country per sport (e.g., Josh drafted USA in Aquatics)
- Accumulates medal points over the duration of the Games
- Is tracked daily via screenshots of medal standings

Players joined at different times, so the "all-time" leaderboard must support a **"from [Game]"** filter.

### Scoring
- **Gold** = 5 pts
- **Silver** = 3 pts
- **Bronze** = 1 pt
- **Total score** = (Gold × 5) + (Silver × 3) + (Bronze × 1)

✅ *Confirmed correct.*

---

## Players

Each player is identified by a `playerId` and shown by their real first name (`displayName`) everywhere in the app. Player roster varies by game — not all players participated in every Olympics.

---

## Data Model

### 1. `games` — One entry per Olympic Games

```json
{
  "id": "paris-2024",
  "name": "Paris 2024 Summer Olympics",
  "year": 2024,
  "season": "Summer",
  "startDate": "2024-07-26",
  "endDate": "2024-08-11",
  "hostCity": "Paris",
  "hostCountry": "France"
}
```

---

### 2. `players` — All-time participant registry

```json
{
  "id": "josh",
  "displayName": "Josh",
  "joinedGameId": "paris-2024"
}
```

> `joinedGameId` is the first Olympics they participated in. Used for the "from [Game]" filter.

---

### 3. `rosters` — Per-game team composition (one row per player × game)

```json
{
  "gameId": "paris-2024",
  "playerId": "josh",
  "draft": {
    "Aquatics": "USA",
    "Archery": "USA",
    "Athletics": "Netherlands",
    "Badminton": "Indonesia",
    "Basketball": "Puerto Rico",
    "Boxing": "Philippines",
    "Canoeing": "Spain",
    "Cycling": "Switzerland",
    "Breaking": "Netherlands",
    "Equestrian": "Spain",
    "Football": "USA",
    "Fencing": "Japan",
    "Field Hockey": "Netherlands",
    "Golf": "Great Britain",
    "Gymnastics": "Israel",
    "Handball": "Iceland",
    "Judo": "Brazil",
    "Modern Pentathlon": "France",
    "Rowing": "Australia",
    "Rugby Sevens": "Australia",
    "Sailing": "Netherlands",
    "Sport Climbing": "USA",
    "Shooting": "Germany",
    "Skateboarding": "Argentina",
    "Surfing": "Brazil",
    "Tennis": "USA",
    "Taekwondo": "Serbia",
    "Triathlon": "Switzerland",
    "Table Tennis": "Chinese Taipei",
    "Volleyball": "Australia",
    "Weightlifting": "Chinese Taipei",
    "Wrestling": "Iran"
  }
}
```

---

### 4. `snapshots` — Daily medal standings (manually entered per day)

This is the core tracking structure. Each snapshot represents one update (one screenshot worth of data).

```json
{
  "id": "paris-2024-day-01",
  "gameId": "paris-2024",
  "date": "2024-07-27",
  "dayLabel": "Day 1",
  "standings": [
    {
      "playerId": "josh",
      "gold": 2,
      "silver": 3,
      "bronze": 4,
      "totalScore": 23
    },
    {
      "playerId": "brandon",
      "gold": 3,
      "silver": 2,
      "bronze": 1,
      "totalScore": 22
    }
  ]
}
```

> Multiple snapshots per day are allowed (e.g., morning + evening updates). They are displayed on the graph in chronological order.

---

## Pages & Features

---

### Page 1: Home / Game Selector

- Grid or list of all Olympic Games
- Click to enter that Game's view
- Shows final standings summary (winner, total players, top score)

---

### Page 2: Game Overview — `/:gameId`

**Final Standings Table** (like the screenshot)
- Rank, Player, Gold, Silver, Bronze, Total Score
- Gold/Silver/Bronze trophy icons for top 3

**Progress Graph**
- X-axis: Date (or Day Number)
- Y-axis: Total Score
- One line per player, color-coded
- Hover tooltip: player name, date, score, medal counts
- Shows all snapshots over the length of the Games

**Navigation tabs or sections:**
- Standings | Graph | Teams | Daily Detail

---

### Page 3: Team Roster — `/:gameId/teams/:playerId`

- Shows the player's name and draft
- Table: Sport → Drafted Country
- Optional: flag emoji or country code next to each country
- No live medal lookup needed — just the draft composition

---

### Page 4: Daily Medal Detail — `/:gameId/day/:date`

- Shows one snapshot (or selectable snapshot if multiple that day)
- Full standings table for that day
- Delta indicators: ↑↓ change in rank or score vs. previous snapshot

---

### Page 5: All-Time Leaderboard — `/leaderboard`

**"From [Game]" filter**
- Dropdown to select starting Game (e.g., "From Paris 2024")
- Recalculates totals using only games from that point forward
- Players who joined after the selected start are included; earlier players are not penalized

**Table columns:**
- Rank | Player | Games Played | Total Gold | Total Silver | Total Bronze | Total Score | Best Finish | Worst Finish

**Graph:**
- Cumulative score per player across Games (one point per Game, not per day)
- X-axis: Olympic Games in order
- Y-axis: Cumulative score

---

## Admin / Data Entry

Since data is entered manually (from screenshots), we need a lightweight way to input snapshots.

### Phase 1 — JSON files (MVP)
- Josh edits JSON directly and commits to git
- Simple, version-controlled, zero infrastructure
- One file per game in `/data/games/`

### Phase 2 — Password-protected Admin UI
- A simple `/admin` route, gated by a hardcoded passphrase (not real auth)
- The league commissioner can enter new snapshots via a form
- Writes to a GitHub Gist or a small hosted JSON store (e.g., JSONBin.io or Supabase free tier)
- Josh can promote this when the commissioner wants to self-serve updates during a live Games

### Snapshot Data Availability
- Some years: only **second-to-last day + finals** are available
- Some years: **every single day** is available
- The data model supports both — snapshots array can have 2 entries or 20, the graph adapts
- Years with only 2 snapshots will show a simple before/after chart

---

## Data File Structure (Recommended)

```
/data
  /games
    paris-2024.json         ← game metadata + roster + snapshots all-in-one
    milan-2026.json
  /players.json             ← all-time player registry
```

### `paris-2024.json` structure:

```json
{
  "game": { ...game metadata... },
  "playerMappings": [
    { "playerId": "josh" },
    { "playerId": "brandon" }
  ],
  "rosters": [
    {
      "playerId": "josh",
      "draft": {
        "Aquatics": "USA",
        "Archery": "USA",
        ...
      }
    }
  ],
  "snapshots": [
    {
      "date": "2024-07-27",
      "dayLabel": "Day 1",
      "standings": [
        { "playerId": "josh", "gold": 2, "silver": 3, "bronze": 4, "totalScore": 23 }
      ]
    }
  ]
}
```

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React + Vite | Fast dev, easy deployment |
| Styling | Tailwind CSS | Rapid UI, responsive |
| Graphing | Recharts | Simple, React-native charting |
| Data (Phase 1) | JSON files in `/data/` | No backend, version-controlled |
| Data (Phase 2) | Vercel serverless + JSONBin or Supabase | Commissioner can self-serve |
| Routing | React Router | Multi-page SPA |
| Deployment | **Vercel** | Free, git-connected, serverless-ready |

---

## Sports List (Paris 2024)

Aquatics, Archery, Athletics, Badminton, Basketball, Boxing, Canoeing, Cycling, Breaking, Equestrian, Football, Fencing, Field Hockey, Golf, Gymnastics, Handball, Judo, Modern Pentathlon, Rowing, Rugby Sevens, Sailing, Sport Climbing, Shooting, Skateboarding, Surfing, Tennis, Taekwondo, Triathlon, Table Tennis, Volleyball, Weightlifting, Wrestling

*(33 sports total)*

---

## Games Roster

| Game | ID | Season | Notes |
|------|----|--------|-------|
| Rio 2016 | `rio-2016` | Summer | First game tracked |
| PyeongChang 2018 | `pyeongchang-2018` | Winter | |
| Tokyo 2020 | `tokyo-2020` | Summer | Held 2021 |
| Beijing 2022 | `beijing-2022` | Winter | |
| Paris 2024 | `paris-2024` | Summer | Full CSV roster available |
| Milano Cortina 2026 | `milano-2026` | Winter | Current / most recent |

> Confirm which of these were actually tracked — not all years may have been played.

---

## Hosting Decision

### ✅ Recommended: Vercel (free tier)

| | GitHub Pages | Vercel |
|--|--|--|
| Cost | Free | Free |
| Custom domain | ✓ | ✓ |
| Deploy from git | ✓ | ✓ |
| Serverless functions (for future admin API) | ✗ | ✓ |
| Automatic preview deploys per branch | ✗ | ✓ |
| Complexity | Minimal | Minimal |

**Verdict:** Start on **Vercel**. It's as simple as GitHub Pages for a static site, but gives us a path to add a small serverless API later when we build the commissioner admin UI — without changing hosting.

**Deploy flow:**
1. Push to `main` → Vercel auto-deploys in ~30 seconds
2. Josh edits JSON locally, commits, pushes → site updates
3. Phase 2: add a `/api/snapshot` serverless route for the admin form

---

## Open Questions / To Confirm

1. ~~**Scoring formula**~~ ✅ Gold=5, Silver=3, Bronze=1
2. ~~**Admin UI**~~ ✅ JSON first, commissioner UI in Phase 2
3. ~~**Hosting**~~ ✅ Vercel
4. **Games played** — Confirm which of Rio/PyeongChang/Tokyo/Beijing/Paris/Milano were tracked
6. **Breaking** — Confirm if included in games after Paris 2024 (it was dropped from LA 2028)
7. **Sports list per game** — Winter games will have a completely different sport list; need a CSV or list per game

---

## MVP Scope

### Phase 1 — Core Viewer (JSON + Vercel)
- [ ] Repo scaffolded (React + Vite + Tailwind + Recharts)
- [ ] `/data/` structure defined and Paris 2024 data entered
- [ ] Home page: game selector grid
- [ ] Game Overview: final standings table + trophy icons
- [ ] Game Overview: progress graph (adapts to however many snapshots exist)
- [ ] Team roster page per player per game
- [ ] Deployed to Vercel

### Phase 2 — History & Leaderboard
- [ ] All games entered (Rio → Milano)
- [ ] All-time leaderboard page with "from [Game]" filter
- [ ] Daily detail / delta view (rank change indicators)
- [ ] Mobile-responsive polish

### Phase 3 — Commissioner Tools
- [ ] Password-gated `/admin` route
- [ ] Form to add new snapshots during live Games
- [ ] Serverless API to persist submissions
- [ ] Export / share standings as image

---

---

*Last updated: February 2025*
*Project: Fantasy Olympics Tracker*
*Stack: React + Vite + Tailwind + Recharts → Vercel*
