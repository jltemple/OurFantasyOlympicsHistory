import { Link } from 'react-router-dom'
import { GAME_REGISTRY } from '../data'
import { PLAYER_MAP } from '../data'
import { getFinalStandings, getWinner } from '../utils/standings'
import SeasonBadge from '../components/ui/SeasonBadge'
import PageWrapper from '../components/layout/PageWrapper'

function GameCard({ gameData }) {
  const { game } = gameData
  const finalStandings = getFinalStandings(gameData)
  const top3 = finalStandings.slice(0, 3)
  const hasData = finalStandings.length > 0

  const podiumConfig = [
    { rank: 1, emoji: '🥇', color: 'text-accent-gold'   },
    { rank: 2, emoji: '🥈', color: 'text-accent-silver' },
    { rank: 3, emoji: '🥉', color: 'text-accent-bronze' },
  ]

  return (
    <Link
      to={`/${game.id}`}
      className="card group block p-6 hover:border-white/20 hover:bg-bg-hover transition-all duration-200 hover:scale-[1.02] hover:shadow-glow"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white group-hover:text-accent-blue transition-colors">
            {game.hostCity}
          </h2>
          <p className="text-white/40 text-sm font-medium mt-0.5">{game.year}</p>
        </div>
        <SeasonBadge season={game.season} />
      </div>

      {/* Divider */}
      <div className="border-t border-bg-border mb-4" />

      {/* Podium */}
      {hasData ? (
        <div className="space-y-2">
          {top3.map((row, i) => {
            const { emoji, color } = podiumConfig[i]
            const player = PLAYER_MAP[row.playerId]
            return (
              <div key={row.playerId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{emoji}</span>
                  <span className={`font-semibold text-sm ${color}`}>
                    {player?.displayName ?? row.playerId}
                  </span>
                </div>
                <span className="text-white/50 text-sm tabular-nums font-medium">
                  {row.totalScore} pts
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-white/30 text-sm">No standings data</p>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-bg-border flex items-center justify-between">
        <span className="text-white/30 text-xs">
          {game.sportCount ? `${game.sportCount} sports` : 'Sports TBD'}
          {' · '}
          {game.medalEvents} medal events
        </span>
        <span className="text-accent-blue text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View →
        </span>
      </div>
    </Link>
  )
}

export default function Home() {
  // Reverse so newest games appear first
  const games = [...GAME_REGISTRY].reverse()

  return (
    <PageWrapper>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
          Fantasy Olympics
        </h1>
        <p className="text-white/50 text-lg">
          {GAME_REGISTRY.length} Games · {
            new Date(GAME_REGISTRY[0].game.startDate).getFullYear()
          }–{
            new Date(GAME_REGISTRY[GAME_REGISTRY.length - 1].game.startDate).getFullYear()
          }
        </p>
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map(gameData => (
          <GameCard key={gameData.game.id} gameData={gameData} />
        ))}
      </div>
    </PageWrapper>
  )
}
