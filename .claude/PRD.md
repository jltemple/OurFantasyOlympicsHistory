# Fantasy Olympics Tracker — Product Requirements Document

## Overview

A web app for a friend group to view, explore, and compare their Fantasy Olympics results across multiple Olympic Games. The app supports per-game team breakdowns, daily medal tracking, historical graphs, and an all-time leaderboard.

---

## Background & Context

The group has participated in Fantasy Olympics across multiple Games (starting from at least Paris 2024). Each participant:
- Drafts one country per sport (e.g., Josh drafted USA in Aquatics)
- Accumulates medal points over the duration of the Games
- Is tracked daily via screenshots of medal standings

Players joined at different times, so the "all-time" leaderboard must support a **"from [Game]"** filter.

### Scoring
- **Gold** = 5 pts
- **Silver** = 3 pts
- **Bronze** = 1 pt
- **Total score** = (Gold × 5) + (Silver × 3) + (Bronze × 1)

> Confirm exact point values with the group if different.

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

**Options (decide before build):**
- [ ] JSON files committed to the repo (simple, version-controlled)
- [ ] Simple admin UI form (enter date + scores for each player)
- [ ] Google Sheets as backend (read-only API)

**Recommended starting point:** JSON files in `/data/` folder, one file per game, imported at build time. Can graduate to a database later.

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

## Tech Stack (Recommended)

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React + Vite | Fast dev, easy deployment |
| Styling | Tailwind CSS | Rapid UI, responsive |
| Graphing | Recharts | Simple, React-native charting |
| Data | JSON files | No backend needed to start |
| Routing | React Router | Multi-page SPA |
| Deployment | GitHub Pages or Vercel | Free, static hosting |

---

## Sports List (Paris 2024)

Aquatics, Archery, Athletics, Badminton, Basketball, Boxing, Canoeing, Cycling, Breaking, Equestrian, Football, Fencing, Field Hockey, Golf, Gymnastics, Handball, Judo, Modern Pentathlon, Rowing, Rugby Sevens, Sailing, Sport Climbing, Shooting, Skateboarding, Surfing, Tennis, Taekwondo, Triathlon, Table Tennis, Volleyball, Weightlifting, Wrestling

*(33 sports total)*

---

## Open Questions / To Confirm

1. **Scoring formula** — Gold=5, Silver=3, Bronze=1? Or different?
2. **Admin UI** — Do we want a form to enter daily snapshots, or just edit JSON?
3. **Other Olympic years** — Which other Games have you tracked? (e.g., Tokyo 2020, LA 2028?)
5. **Historical snapshot data** — Do you have the daily screenshots ready to transcribe? Or just final standings?
6. **Breaking** — Is this included in future games? (It was dropped after Paris 2024)
7. **Hosting** — GitHub Pages, Vercel, or local only?

---

## MVP Scope

### Phase 1 (MVP)
- [ ] Data structure finalized + Paris 2024 data entered
- [ ] Game Overview page with final standings table
- [ ] Progress graph (if daily snapshots available)
- [ ] Team roster page per player

### Phase 2
- [ ] All-time leaderboard with "from [Game]" filter
- [ ] Daily detail / delta view
- [ ] Multiple games supported

### Phase 3
- [ ] Admin data entry UI
- [ ] Mobile-responsive polish
- [ ] Export / share standings image

---

*Last updated: 2025*
*Project: Fantasy Olympics Tracker*
