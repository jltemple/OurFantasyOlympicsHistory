import { useMemo } from 'react'
import { PLAYERS } from '../data'
import { computeAllTimeStats, buildCumulativeSeries } from '../utils/leaderboard'

/**
 * @param {string|null} fromGameId  - Filter games to start from this gameId
 * @param {'raw'|'perEvent'} mode   - Sort column for leaderboard table
 */
export function useLeaderboard(fromGameId, mode = 'raw') {
  const stats = useMemo(
    () => computeAllTimeStats(PLAYERS, fromGameId),
    [fromGameId]
  )

  const rows = useMemo(() => {
    const sorted = [...stats].sort((a, b) =>
      mode === 'perEvent'
        ? (b.ptsPerMedalEvent ?? 0) - (a.ptsPerMedalEvent ?? 0)
        : b.totalScore - a.totalScore
    )
    return sorted.map((row, i) => ({ ...row, rank: i + 1 }))
  }, [stats, mode])

  const cumulativeSeries = useMemo(
    () => buildCumulativeSeries(PLAYERS, fromGameId),
    [fromGameId]
  )

  return { rows, cumulativeSeries }
}
