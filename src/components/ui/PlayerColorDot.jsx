import { PLAYER_COLORS } from '../../constants/playerColors'

export default function PlayerColorDot({ playerId, size = 8 }) {
  const color = PLAYER_COLORS[playerId] ?? '#6b7280'
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color }}
    />
  )
}
