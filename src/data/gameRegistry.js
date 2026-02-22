// Canonical chronological order — this is the source of truth for game ordering
// across Home, Leaderboard chart X-axis, and the "From Game" filter.
import sochi2014      from '../../data/games/sochi-2014.json'
import rio2016        from '../../data/games/rio-2016.json'
import pyeongchang2018 from '../../data/games/pyeongchang-2018.json'
import tokyo2020      from '../../data/games/tokyo-2020.json'
import beijing2022    from '../../data/games/beijing-2022.json'
import paris2024      from '../../data/games/paris-2024.json'
import milano2026     from '../../data/games/milano-2026.json'

export const GAME_REGISTRY = [
  sochi2014,
  rio2016,
  pyeongchang2018,
  tokyo2020,
  beijing2022,
  paris2024,
  milano2026,
]

// Quick O(1) lookup by gameId
export const GAME_MAP = Object.fromEntries(
  GAME_REGISTRY.map(g => [g.game.id, g])
)
