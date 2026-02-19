import { useParams, Link } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import { PLAYER_MAP } from '../data'
import { getFlag } from '../constants/countryFlags'
import PageWrapper from '../components/layout/PageWrapper'
import SeasonBadge from '../components/ui/SeasonBadge'
import PlayerColorDot from '../components/ui/PlayerColorDot'
import TrophyIcon from '../components/ui/TrophyIcon'

// ── Sport row ──────────────────────────────────────────────────────────────────
function SportRow({ sport, country }) {
  const flag = getFlag(country)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-bg-border last:border-0 gap-3">
      <span className="text-white/70 text-sm">{sport}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xl leading-none">{flag}</span>
        <span className="text-white text-sm font-medium">{country}</span>
      </div>
    </div>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ label, value, className = '' }) {
  return (
    <div className={`card px-4 py-3 text-center ${className}`}>
      <p className="text-xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RosterDetail() {
  const { gameId, playerId } = useParams()
  const { gameData, finalStandings, playerMappingsMap, error } = useGame(gameId)

  if (error) {
    return (
      <PageWrapper>
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-white mb-2">Game Not Found</h1>
          <p className="text-white/40 mb-6">{error}</p>
          <Link to="/" className="btn-primary">← Back to Home</Link>
        </div>
      </PageWrapper>
    )
  }

  const { game, rosters } = gameData
  const player    = PLAYER_MAP[playerId]
  const teamName  = playerMappingsMap.get(playerId)
  const standing  = finalStandings.find(r => r.playerId === playerId)
  const rosterObj = rosters?.find(r => r.playerId === playerId)

  if (!player || !standing) {
    return (
      <PageWrapper>
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🙅</p>
          <h1 className="text-2xl font-bold text-white mb-2">Player Not Found</h1>
          <p className="text-white/40 mb-6">
            {player?.displayName ?? playerId} did not participate in {game.name}.
          </p>
          <Link to={`/${gameId}`} className="btn-primary">← Back to {game.name}</Link>
        </div>
      </PageWrapper>
    )
  }

  const draftEntries = rosterObj?.draft ? Object.entries(rosterObj.draft) : []
  const hasDraft = draftEntries.length > 0

  // Sort sports alphabetically
  const sortedDraft = [...draftEntries].sort(([a], [b]) => a.localeCompare(b))

  const dateRange = [game.startDate, game.endDate]
    .filter(Boolean)
    .map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
    .join(' – ')

  return (
    <PageWrapper>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
        <Link to="/" className="hover:text-white transition-colors">All Games</Link>
        <span>/</span>
        <Link to={`/${gameId}`} className="hover:text-white transition-colors">{game.name}</Link>
        <span>/</span>
        <span className="text-white/70">{player?.displayName ?? playerId}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <SeasonBadge season={game.season} />
            <span className="text-white/30 text-sm">{dateRange}</span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <PlayerColorDot playerId={playerId} size={14} />
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              {player?.displayName ?? playerId}
            </h1>
          </div>
          {teamName && (
            <p className="text-white/40 text-sm ml-[22px]">{teamName}</p>
          )}
        </div>

        {/* Final result stats */}
        <div className="flex gap-3">
          <div className="card px-4 py-3 text-center min-w-[64px]">
            <TrophyIcon rank={standing.rank} size="text-2xl" />
            <p className="text-xs text-white/40 mt-1">Finish</p>
          </div>
          <StatChip label="Score" value={standing.totalScore} />
          <StatChip label="🥇" value={standing.gold} className="text-accent-gold" />
          <StatChip label="🥈" value={standing.silver} className="text-accent-silver" />
          <StatChip label="🥉" value={standing.bronze} className="text-accent-bronze" />
        </div>
      </div>

      {/* Draft picks */}
      <div className="card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-bg-border flex items-center justify-between">
          <h2 className="font-semibold text-white">Draft Picks</h2>
          {hasDraft && (
            <span className="text-xs text-white/40">{draftEntries.length} sports</span>
          )}
        </div>

        {!hasDraft ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-white/50">Draft data is not available for this game.</p>
          </div>
        ) : (
          <div className="px-4 sm:px-6 py-2">
            {sortedDraft.map(([sport, country]) => (
              <SportRow key={sport} sport={sport} country={country} />
            ))}
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="mt-6">
        <Link
          to={`/${gameId}`}
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          ← Back to {game.name}
        </Link>
      </div>
    </PageWrapper>
  )
}
