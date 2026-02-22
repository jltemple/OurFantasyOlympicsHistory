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
 * Builds a per-game pts-per-medal-event series (one point per game, not cumulative).
 * Shape: [{ gameLabel, gameId, [playerId]: ptsPerMedalEvent|null, ... }, ...]
 *
 * Each point is the player's score for that single game divided by medalEvents.
 * Players who didn't participate in a game get null (gap in line).
 */
export function buildGameSeriesPerEvent(fromGameId) {
  const games = filterGamesFrom(fromGameId)
  if (!games.length) return []

  const activePlayerIds = new Set()
  games.forEach(gameData => {
    gameData.playerMappings?.forEach(m => activePlayerIds.add(m.playerId))
  })

  return games.map(gameData => {
    const { game } = gameData
    const medalEvents = game.medalEvents ?? 0

    const point = {
      gameLabel: `${game.hostCity} '${String(game.year).slice(2)}`,
      gameId: game.id,
    }

    activePlayerIds.forEach(pid => {
      const result = getPlayerFinalResult(gameData, pid)
      if (result && medalEvents > 0) {
        point[pid] = Math.round((result.totalScore / medalEvents) * 100) / 100
      } else {
        point[pid] = null
      }
    })

    return point
  })
}

/**
 * Builds a simple per-game cumulative series (one point per game).
 * Shape: [{ gameLabel, gameId, [playerId]: cumulativeScore|null, ... }, ...]
 *
 * Players who haven't joined yet get null (key absent → line not started).
 * Players who sat out a game keep their last cumulative value (flat line).
 */
export function buildGameSeries(fromGameId) {
  const games = filterGamesFrom(fromGameId)
  if (!games.length) return []

  const activePlayerIds = new Set()
  games.forEach(gameData => {
    gameData.playerMappings?.forEach(m => activePlayerIds.add(m.playerId))
  })

  const cumulative = {}
  activePlayerIds.forEach(pid => { cumulative[pid] = 0 })

  return games.map(gameData => {
    const { game } = gameData
    const gamePlayers = new Set(gameData.playerMappings?.map(m => m.playerId) ?? [])

    const point = {
      gameLabel: `${game.hostCity} '${String(game.year).slice(2)}`,
      gameId: game.id,
    }

    activePlayerIds.forEach(pid => {
      const result = getPlayerFinalResult(gameData, pid)
      if (result) {
        cumulative[pid] += result.totalScore
        point[pid] = cumulative[pid]
      } else if (cumulative[pid] > 0) {
        // Played before, sat this one out — hold flat
        point[pid] = cumulative[pid]
      }
      // else hasn't joined yet — key absent, line not started
    })

    return point
  })
}

/**
 * Builds a snapshot-level cumulative series across all games in the filtered range.
 *
 * One data point per snapshot (across all games), so the chart shows every update day
 * and game regions can be shaded with ReferenceArea.
 *
 * Returns:
 * {
 *   series: [{
 *     idx,        // global x-axis index
 *     gameId,
 *     gameName,
 *     season,
 *     dayLabel,
 *     date,
 *     [playerId]: cumulativeScore | null | undefined
 *       // null  = in this game but missing from this snapshot (bridged by connectNulls)
 *       // undefined (key absent) = player not yet in the league (line not started)
 *       // number = cumulative total
 *   }]
 *
 *   gameRegions: [{
 *     gameId, gameName, season, year,
 *     startIdx, endIdx   // inclusive x-axis indices for ReferenceArea
 *   }]
 *
 *   activePlayerIds: Set<playerId>  — all players in any game in range
 *   lastGamePlayerIds: Set<playerId> — players in the final game (= "current" players)
 * }
 */
export function buildSnapshotSeries(fromGameId) {
  const games = filterGamesFrom(fromGameId)
  if (!games.length) {
    return { series: [], gameRegions: [], activePlayerIds: new Set(), lastGamePlayerIds: new Set() }
  }

  // All players across any game in range
  const activePlayerIds = new Set()
  games.forEach(gameData => {
    gameData.playerMappings?.forEach(m => activePlayerIds.add(m.playerId))
  })

  // "Current" players = those in the most recent game
  const lastGame = games[games.length - 1]
  const lastGamePlayerIds = new Set(lastGame.playerMappings?.map(m => m.playerId) ?? [])

  // Running cumulative total committed after each game completes
  const cumulative = {}
  activePlayerIds.forEach(pid => { cumulative[pid] = 0 })

  const series = []
  const gameRegions = []
  let globalIdx = 0

  games.forEach(gameData => {
    const { game, snapshots } = gameData
    if (!snapshots?.length) return

    const gamePlayers = new Set(gameData.playerMappings?.map(m => m.playerId) ?? [])

    // Each player's committed total before this game starts
    const priorCumulative = {}
    gamePlayers.forEach(pid => { priorCumulative[pid] = cumulative[pid] })

    const regionStart = globalIdx

    snapshots.forEach(snapshot => {
      const scoreMap = {}
      snapshot.standings.forEach(row => { scoreMap[row.playerId] = row.totalScore })

      const point = {
        idx:      globalIdx,
        gameId:   game.id,
        gameName: game.name,
        season:   game.season,
        dayLabel: snapshot.dayLabel,
        date:     snapshot.date,
      }

      activePlayerIds.forEach(pid => {
        if (gamePlayers.has(pid)) {
          // In this game: cumulative = prior total + this game's running score
          const gameScore = scoreMap[pid] ?? null
          point[pid] = gameScore !== null ? priorCumulative[pid] + gameScore : null
        } else if (cumulative[pid] > 0) {
          // Played before but sat this game out: hold their last value flat
          point[pid] = cumulative[pid]
        }
        // else: player hasn't joined yet — key is absent, line not yet started
      })

      series.push(point)
      globalIdx++
    })

    // Commit final scores after all snapshots for this game
    const finalSnap = snapshots[snapshots.length - 1]
    finalSnap.standings.forEach(row => {
      if (gamePlayers.has(row.playerId)) {
        cumulative[row.playerId] = priorCumulative[row.playerId] + row.totalScore
      }
    })

    gameRegions.push({
      gameId:   game.id,
      gameName: game.name,
      season:   game.season,
      year:     game.year,
      startIdx: regionStart,
      endIdx:   globalIdx - 1,
    })
  })

  return { series, gameRegions, activePlayerIds, lastGamePlayerIds }
}
