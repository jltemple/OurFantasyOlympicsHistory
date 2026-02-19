/**
 * Pure utility functions for extracting standings data from a single game object.
 * No React dependencies — safe to unit-test in isolation.
 */

/**
 * Returns the final snapshot (dayLabel === 'Final'), falling back to the last snapshot.
 */
export function getFinalSnapshot(gameData) {
  if (!gameData?.snapshots?.length) return null
  return (
    gameData.snapshots.find(s => s.dayLabel === 'Final') ??
    gameData.snapshots[gameData.snapshots.length - 1]
  )
}

/**
 * Returns the final standings array, sorted by totalScore desc, with rank added.
 */
export function getFinalStandings(gameData) {
  const snapshot = getFinalSnapshot(gameData)
  if (!snapshot) return []
  return [...snapshot.standings]
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((row, i) => ({ ...row, rank: i + 1 }))
}

/**
 * Returns the playerId of the 1st-place finisher.
 */
export function getWinner(gameData) {
  const standings = getFinalStandings(gameData)
  return standings[0]?.playerId ?? null
}

/**
 * Returns final rank + scores for a single player in this game, or null if not present.
 */
export function getPlayerFinalResult(gameData, playerId) {
  const standings = getFinalStandings(gameData)
  return standings.find(s => s.playerId === playerId) ?? null
}

/**
 * Builds a Recharts-compatible progress series from all snapshots.
 * Shape: [{ dayLabel, date, [playerId]: totalScore, ... }, ...]
 *
 * Players absent from a snapshot get null (not 0) so Recharts can
 * bridge the gap with connectNulls rather than drop to zero.
 */
export function buildProgressSeries(gameData) {
  if (!gameData?.snapshots?.length) return []

  // Collect all playerIds that appear anywhere in this game's snapshots
  const allPlayerIds = [
    ...new Set(
      gameData.snapshots.flatMap(s => s.standings.map(r => r.playerId))
    ),
  ]

  return gameData.snapshots.map(snapshot => {
    const point = { dayLabel: snapshot.dayLabel, date: snapshot.date }
    // Initialize all to null, then fill in present players
    allPlayerIds.forEach(pid => { point[pid] = null })
    snapshot.standings.forEach(row => {
      point[row.playerId] = row.totalScore
    })
    return point
  })
}

/**
 * Returns a playerMappings lookup: Map<playerId, teamName>
 */
export function buildPlayerMappingsMap(gameData) {
  const map = new Map()
  gameData?.playerMappings?.forEach(m => {
    map.set(m.playerId, m.teamName)
  })
  return map
}

/**
 * Returns all playerIds present in this game (from playerMappings).
 */
export function getGamePlayerIds(gameData) {
  return (gameData?.playerMappings ?? []).map(m => m.playerId)
}
