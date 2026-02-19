# Fantasy Olympics Tracker — Product Requirements Document

## Overview

A web app for a friend group to view, explore, and compare their Fantasy Olympics results across multiple Olympic Games. The app supports per-game team breakdowns, daily medal tracking, historical graphs, and an all-time leaderboard.

---

## Background & Context

The group has participated in Fantasy Olympics across multiple Games, starting from **Sochi 2014** through **Milano Cortina 2026**. Each participant:
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

> Tokyo 2020 had **Pat, Andrea, Sal** instead of **Miles, Jon, Bryan** (who appear in Paris 2024).

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
  "hostCountry": "France",
  "sportCount": 33,
  "medalEvents": 329
}
```

> `sportCount` = number of distinct sports players drafted from (e.g. 33 for Paris 2024).
> `medalEvents` = total gold medals available across all disciplines at that Olympics (e.g. 329 for Paris 2024 — Aquatics alone has ~35 events). Used to compute "points per medal event" on the all-time leaderboard. Sourced from Wikipedia / Olympics.com; no estimation needed.

---

### 2. `players` — All-time participant registry

```json
{
  "id": "josh",
  "displayName": "Josh",
  "joinedGameId": "sochi-2014"
}
```

> `joinedGameId` is the first Olympics they participated in. Used for the "from [Game]" filter on the leaderboard.

### Note on Winter vs. Summer Games

Winter and Summer Olympics have **entirely different sports lists** and run on alternating 2-year cycles. The app treats them as the same chronological series for the all-time leaderboard, but each game's roster and draft data is completely independent.

**Sports list data availability:**
- Sochi 2014: ❌ No sports CSV available — standings data only
- Rio 2016 → Milano Cortina 2026: ✅ Sports CSVs available

The `medalEvents` field on each game object is used to compute "points per medal event" on the leaderboard. All values are confirmed from official sources — no estimation needed, including Sochi 2014 (98 events).

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
- Players who joined after the selected start are included; earlier players are not penalized for games before they joined

**View toggle: Raw Score ↔ Points per Medal Event**
- Default view: **Raw Score** — total accumulated points across all selected games
- Alternate view: **Points per Medal Event** — total score ÷ total medal events across all selected games
  - "Medal events" = total number of gold medals available at that Olympics (every sport × every discipline within it)
  - Each drafted sport contains multiple medal events (e.g. Aquatics includes freestyle, backstroke, butterfly, relay, etc.)
  - This is the fairest normalization: a player who scored 246 pts at Paris 2024 (329 medal events) vs. someone who scored 180 pts at Beijing 2022 (109 medal events) are on truly comparable footing
  - Also normalizes for players who joined later and have played fewer total games

**Total medal events per game (confirmed):**

| Game | Season | Medal Events |
|------|--------|-------------|
| Sochi 2014 | Winter | 98 |
| Rio 2016 | Summer | 306 |
| PyeongChang 2018 | Winter | 102 |
| Tokyo 2020 | Summer | 339 |
| Beijing 2022 | Winter | 109 |
| Paris 2024 | Summer | 329 |
| Milano Cortina 2026 | Winter | 116 *(confirmed, games in progress)* |

> Source: Wikipedia / Olympics.com official programme counts.
> Note: All players draft the same set of sports per game, so the total medal events figure is shared equally — individual "pts per event" only differs by score, not by which sports they picked.

**Table columns (Raw Score view):**
| Rank | Player | Games Played | Total Gold | Total Silver | Total Bronze | Total Score | Best Finish | Worst Finish | Pts/Event |

**Table columns (Pts/Event view):**
- Same columns but sorted by Pts/Event, with Total Score shown as secondary

**Graph:**
- Toggle: Cumulative total score **or** per-game score (bar chart per game)
- X-axis: Olympic Games in chronological order
- Y-axis: Score
- One line/bar per player, color-coded by player (consistent colors throughout app)
- Players only appear from their `joinedGameId` onward

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

## Sports Lists

Each game has its own sport list. Winter and Summer lists are completely different. Sports lists are sourced from CSVs (Rio 2016 onward).

### Paris 2024 (Summer) — 33 sports
Aquatics, Archery, Athletics, Badminton, Basketball, Boxing, Canoeing, Cycling, Breaking, Equestrian, Football, Fencing, Field Hockey, Golf, Gymnastics, Handball, Judo, Modern Pentathlon, Rowing, Rugby Sevens, Sailing, Sport Climbing, Shooting, Skateboarding, Surfing, Tennis, Taekwondo, Triathlon, Table Tennis, Volleyball, Weightlifting, Wrestling

### Other Games
Sports lists for Rio 2016, PyeongChang 2018, Tokyo 2020, Beijing 2022, Milano Cortina 2026 will be loaded from their respective CSVs into each game's JSON file. Sochi 2014 sports list not available — `sportCount` to be estimated.

---

## Games Roster

| # | Game | ID | Season | Notes |
|---|------|----|--------|-------|
| 1 | Sochi 2014 | `sochi-2014` | Winter | First game tracked |
| 2 | Rio 2016 | `rio-2016` | Summer | |
| 3 | PyeongChang 2018 | `pyeongchang-2018` | Winter | |
| 4 | Tokyo 2020 | `tokyo-2020` | Summer | Held 2021 |
| 5 | Beijing 2022 | `beijing-2022` | Winter | |
| 6 | Paris 2024 | `paris-2024` | Summer | ✅ Full CSV roster available |
| 7 | Milano Cortina 2026 | `milano-2026` | Winter | Current / most recent |

7 total Games. Alternates Summer/Winter every ~2 years.

> Note: Not all players will have participated in all 7 games. The "from [Game]" filter on the leaderboard handles this.

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
4. ~~**Games played**~~ ✅ Sochi 2014, Rio 2016, PyeongChang 2018, Tokyo 2020, Beijing 2022, Paris 2024, Milano Cortina 2026
5. ~~**Leaderboard scoring**~~ ✅ Raw score totals + Points per Medal Event (score ÷ sports drafted) toggle
6. ~~**Display names**~~ ✅ Always show real first names
7. ~~**Sports list data**~~ ✅ Available for Rio 2016 onward; Sochi 2014 is standings-only
8. **Breaking** — Was this sport included in any games other than Paris 2024? (Dropped after 2024)
10. ~~**Sochi 2014 sport count**~~ ✅ All medal event counts confirmed from Wikipedia/Olympics.com (see table in leaderboard section)

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
