import { useMemo } from 'react'
import { GAME_MAP } from '../data'
import {
  getFinalStandings,
  buildProgressSeries,
  buildPlayerMappingsMap,
  getGamePlayerIds,
} from '../utils/standings'

/**
 * Returns all derived data needed to render a single game's pages.
 * Returns { error } if gameId is not found.
 */
export function useGame(gameId) {
  const gameData = GAME_MAP[gameId] ?? null

  const finalStandings    = useMemo(() => gameData ? getFinalStandings(gameData)      : [], [gameData])
  const progressSeries    = useMemo(() => gameData ? buildProgressSeries(gameData)    : [], [gameData])
  const playerMappingsMap = useMemo(() => gameData ? buildPlayerMappingsMap(gameData) : new Map(), [gameData])
  const playerIds         = useMemo(() => gameData ? getGamePlayerIds(gameData)        : [], [gameData])

  if (!gameData) return { gameData: null, error: `Game "${gameId}" not found.` }

  return {
    gameData,
    finalStandings,
    progressSeries,
    playerMappingsMap,
    playerIds,
    error: null,
  }
}
