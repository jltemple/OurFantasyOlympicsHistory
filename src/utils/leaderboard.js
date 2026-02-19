/**
 * Pure utility functions for cross-game leaderboard aggregation.
 * No React dependencies.
 */
import { GAME_REGISTRY } from '../data/gameRegistry'
import { getFinalStandings, getPlayerFinalResult } from './standings'

/**
 * Returns games filtered to start from fromGameId (inclusive), preserving order.
 * If fromGameId is null/undefined, returns all games.
 */
export function filterGamesFrom(fromGameId) {
  if (!fromGameId) return GAME_REGISTRY
  const idx = GAME_REGISTRY.findIndex(g => g.game.id === fromGameId)
  return idx === -1 ? GAME_REGISTRY : GAME_REGISTRY.slice(idx)
}

/**
 * Computes all-time stats for every player across the filtered game range.
 * Only includes players who actually participated in at least one game in range.
 *
 * Returns array of:
 * {
 *   playerId, displayName,
 *   gamesPlayed, totalGold, totalSilver, totalBronze, totalScore,
 *   medalEvents,       // sum of game.medalEvents for games played
 *   ptsPerMedalEvent,  // totalScore / medalEvents (null if medalEvents === 0)
 *   bestFinish,        // lowest rank number (1 is best)
 *   worstFinish,       // highest rank number
 *   gameResults: [{ gameId, gameName, rank, score }]
 * }
 */
export function computeAllTimeStats(players, fromGameId) {
  const games = filterGamesFrom(fromGameId)

  return players
    .map(player => {
      let gamesPlayed = 0
      let totalGold = 0
      let totalSilver = 0
      let totalBronze = 0
      let totalScore = 0
      let medalEvents = 0
      let bestFinish = Infinity
      let worstFinish = -Infinity
      const gameResults = []

      games.forEach(gameData => {
        const result = getPlayerFinalResult(gameData, player.id)
        if (!result) return

        gamesPlayed++
        totalGold   += result.gold
        totalSilver += result.silver
        totalBronze += result.bronze
        totalScore  += result.totalScore
        medalEvents += gameData.game.medalEvents ?? 0

        if (result.rank < bestFinish)  bestFinish  = result.rank
        if (result.rank > worstFinish) worstFinish = result.rank

        gameResults.push({
          gameId:   gameData.game.id,
          gameName: gameData.game.name,
          rank:     result.rank,
          score:    result.totalScore,
        })
      })

      if (gamesPlayed === 0) return null

      return {
        playerId:         player.id,
        displayName:      player.displayName,
        gamesPlayed,
        totalGold,
        totalSilver,
        totalBronze,
        totalScore,
        medalEvents,
        ptsPerMedalEvent: medalEvents > 0
          ? Math.round((totalScore / medalEvents) * 100) / 100
          : null,
        bestFinish:  bestFinish  === Infinity  ? null : bestFinish,
        worstFinish: worstFinish === -Infinity ? null : worstFinish,
        gameResults,
      }
    })
    .filter(Boolean)
}

/**
 * Builds a Recharts-compatible cumulative score series across games.
 * Shape: [{ gameLabel, [playerId]: cumulativeScore, ... }, ...]
 *
 * Only players present in at least one game in the range are included.
 * Players not yet present in a game get null for that entry.
 */
export function buildCumulativeSeries(players, fromGameId) {
  const games = filterGamesFrom(fromGameId)

  // Determine which players appear in any game in range
  const activePlayerIds = new Set()
  games.forEach(gameData => {
    gameData.playerMappings?.forEach(m => activePlayerIds.add(m.playerId))
  })

  // Running cumulative totals per player
  const cumulative = {}
  activePlayerIds.forEach(pid => { cumulative[pid] = 0 })

  return games.map(gameData => {
    const point = {
      gameLabel: `${gameData.game.hostCity} '${String(gameData.game.year).slice(2)}`,
      gameId: gameData.game.id,
    }

    activePlayerIds.forEach(pid => {
      const result = getPlayerFinalResult(gameData, pid)
      if (result) {
        cumulative[pid] += result.totalScore
        point[pid] = cumulative[pid]
      } else {
        // Player not in this game — carry forward their cumulative if they've started,
        // otherwise null (they haven't joined yet)
        point[pid] = cumulative[pid] > 0 ? cumulative[pid] : null
      }
    })

    return point
  })
}
