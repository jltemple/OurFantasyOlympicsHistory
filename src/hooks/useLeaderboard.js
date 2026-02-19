import { useMemo } from 'react'
import { PLAYERS } from '../data'
import { computeAllTimeStats, buildSnapshotSeries } from '../utils/leaderboard'

/**
 * @param {string|null} fromGameId       - Filter games to start from this gameId
 * @param {'raw'|'perEvent'} mode        - Sort column for leaderboard table
 * @param {boolean} currentPlayersOnly   - When true, filter chart/table to players in the last game
 */
export function useLeaderboard(fromGameId, mode = 'raw', currentPlayersOnly = false) {
  const stats = useMemo(
    () => computeAllTimeStats(PLAYERS, fromGameId),
    [fromGameId]
  )

  const snapshotData = useMemo(
    () => buildSnapshotSeries(fromGameId),
    [fromGameId]
  )

  const rows = useMemo(() => {
    let filtered = stats
    if (currentPlayersOnly) {
      filtered = stats.filter(r => snapshotData.lastGamePlayerIds.has(r.playerId))
    }
    const sorted = [...filtered].sort((a, b) =>
      mode === 'perEvent'
        ? (b.ptsPerMedalEvent ?? 0) - (a.ptsPerMedalEvent ?? 0)
        : b.totalScore - a.totalScore
    )
    return sorted.map((row, i) => ({ ...row, rank: i + 1 }))
  }, [stats, mode, currentPlayersOnly, snapshotData.lastGamePlayerIds])

  return {
    rows,
    series:             snapshotData.series,
    gameRegions:        snapshotData.gameRegions,
    activePlayerIds:    snapshotData.activePlayerIds,
    lastGamePlayerIds:  snapshotData.lastGamePlayerIds,
  }
}
