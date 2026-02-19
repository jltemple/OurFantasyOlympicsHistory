// Single import point for all app data
export { GAME_REGISTRY, GAME_MAP } from './gameRegistry'

import rawPlayers from '../../data/players.json'
export const PLAYERS = rawPlayers
export const PLAYER_MAP = Object.fromEntries(rawPlayers.map(p => [p.id, p]))
