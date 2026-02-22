import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import { PLAYER_MAP } from '../data'
import PageWrapper from '../components/layout/PageWrapper'
import Tabs from '../components/ui/Tabs'
import TrophyIcon from '../components/ui/TrophyIcon'
import SeasonBadge from '../components/ui/SeasonBadge'
import PlayerColorDot from '../components/ui/PlayerColorDot'
import ProgressLineChart from '../components/charts/ProgressLineChart'
import { getFlag } from '../constants/countryFlags'
import milano2026Draft from '../../data/draft-logs/milano-2026-draft.json'

// Map gameId → draft log data (statically imported so Vite bundles them correctly)
const DRAFT_LOGS = {
  'milano-2026': milano2026Draft,
}

const BASE_TABS = [
  { label: 'Standings', value: 'standings' },
  { label: 'Progress',  value: 'progress'  },
  { label: 'Rosters',   value: 'rosters'   },
]

// ── Standings Tab ─────────────────────────────────────────────────────────────
function StandingsTab({ finalStandings }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-bg-border">
            <th className="text-left py-3 pl-4 w-12">Rank</th>
            <th className="text-left py-3 pl-3">Player</th>
            <th className="text-right py-3 pr-4">🥇</th>
            <th className="text-right py-3 pr-4">🥈</th>
            <th className="text-right py-3 pr-4">🥉</th>
            <th className="text-right py-3 pr-4 font-semibold">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bg-border">
          {finalStandings.map(row => {
            const player = PLAYER_MAP[row.playerId]
            const isTop3 = row.rank <= 3
            return (
              <tr
                key={row.playerId}
                className={`table-row-hover ${isTop3 ? 'bg-white/[0.02]' : ''}`}
              >
                <td className="py-3.5 pl-4">
                  <TrophyIcon rank={row.rank} />
                </td>
                <td className="py-3.5 pl-3">
                  <div className="flex items-center gap-2">
                    <PlayerColorDot playerId={row.playerId} />
                    <span className="font-semibold text-white">
                      {player?.displayName ?? row.playerId}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 text-right text-accent-gold font-medium tabular-nums">{row.gold}</td>
                <td className="py-3.5 pr-4 text-right text-accent-silver font-medium tabular-nums">{row.silver}</td>
                <td className="py-3.5 pr-4 text-right text-accent-bronze font-medium tabular-nums">{row.bronze}</td>
                <td className="py-3.5 pr-4 text-right font-bold text-white tabular-nums">{row.totalScore}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Progress Tab ──────────────────────────────────────────────────────────────
function ProgressTab({ gameData }) {
  const snapshotCount = gameData.snapshots?.length ?? 0
  return (
    <div>
      <div className="mb-4 text-white/40 text-sm">
        {snapshotCount} update{snapshotCount !== 1 ? 's' : ''} recorded
      </div>
      <ProgressLineChart gameData={gameData} height={420} />
    </div>
  )
}

// ── Rosters Tab ───────────────────────────────────────────────────────────────
function RostersTab({ gameData, playerMappingsMap, gameId }) {
  const hasRosters = gameData.rosters?.length > 0

  if (!hasRosters) {
    return (
      <div className="py-12 text-center">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-white/50">Roster data is not available for this game.</p>
      </div>
    )
  }

  const rosterMap = Object.fromEntries(
    gameData.rosters.map(r => [r.playerId, r])
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {gameData.playerMappings.map(mapping => {
        const player   = PLAYER_MAP[mapping.playerId]
        const hasRoster = !!rosterMap[mapping.playerId]
        return (
          <div
            key={mapping.playerId}
            className="card p-4 flex items-center justify-between gap-3 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <PlayerColorDot playerId={mapping.playerId} size={10} />
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">
                  {player?.displayName ?? mapping.playerId}
                </p>
              </div>
            </div>
            {hasRoster ? (
              <Link
                to={`/${gameId}/roster/${mapping.playerId}`}
                className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap flex-shrink-0"
              >
                View Roster
              </Link>
            ) : (
              <span className="text-xs text-white/25 flex-shrink-0">No data</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Draft Log Tab ─────────────────────────────────────────────────────────────
function DraftLogTab({ draftData }) {
  if (!draftData) {
    return (
      <div className="py-12 text-center">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-white/50">Draft log is not available for this game.</p>
      </div>
    )
  }

  const totalPicks = draftData.rounds.reduce((sum, r) => sum + r.picks.length, 0)

  return (
    <div>
      <div className="mb-4 text-white/40 text-sm">
        {draftData.rounds.length} rounds · {totalPicks} total picks
      </div>
      <div className="overflow-x-auto rounded-lg border border-bg-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-bg-border bg-white/[0.02]">
              <th className="text-center py-2 px-3 w-12">#</th>
              <th className="text-left py-2 px-3 w-36">Player</th>
              <th className="text-left py-2 px-3">Sport</th>
              <th className="text-left py-2 px-3">Country</th>
            </tr>
          </thead>
          <tbody>
            {draftData.rounds.map(round => (
              <>
                <tr key={`round-${round.round}`} className="border-t border-bg-border">
                  <td
                    colSpan={4}
                    className="py-1.5 px-3 text-xs font-semibold uppercase tracking-widest text-white/25 bg-white/[0.02]"
                  >
                    Round {round.round}
                  </td>
                </tr>
                {round.picks.map(pick => {
                  const player = PLAYER_MAP[pick.playerId]
                  return (
                    <tr key={pick.pick} className="table-row-hover border-t border-bg-border">
                      <td className="py-2.5 px-3 text-center text-white/30 tabular-nums text-xs">
                        {pick.pick}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <PlayerColorDot playerId={pick.playerId} />
                          <span className="font-medium text-white">
                            {player?.displayName ?? pick.playerId}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-white/70">{pick.sport}</td>
                      <td className="py-2.5 px-3 text-white/50">
                        <span className="flex items-center gap-1.5">
                          <span className="text-base leading-none">{getFlag(pick.country)}</span>
                          {pick.country}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GameOverview() {
  const { gameId } = useParams()
  const { gameData, finalStandings, playerMappingsMap, error } = useGame(gameId)
  const [activeTab, setActiveTab] = useState('standings')

  const draftData = DRAFT_LOGS[gameId] ?? null
  const hasDraftLog = draftData !== null

  const TABS = hasDraftLog
    ? [...BASE_TABS, { label: 'Draft Log', value: 'draftlog' }]
    : BASE_TABS

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

  const { game } = gameData
  const dateRange = [game.startDate, game.endDate]
    .filter(Boolean)
    .map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
    .join(' – ')

  return (
    <PageWrapper>
      {/* Breadcrumb */}
      <Link to="/" className="text-white/40 hover:text-white text-sm transition-colors mb-6 inline-block">
        ← All Games
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <SeasonBadge season={game.season} />
            <span className="text-white/30 text-sm">{dateRange}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">{game.name}</h1>
        </div>
        <div className="flex gap-4 text-center">
          <div className="card px-4 py-2">
            <p className="text-2xl font-bold text-white">{finalStandings.length}</p>
            <p className="text-xs text-white/40 mt-0.5">Players</p>
          </div>
          <div className="card px-4 py-2">
            <p className="text-2xl font-bold text-white">{game.medalEvents}</p>
            <p className="text-xs text-white/40 mt-0.5">Medal Events</p>
          </div>
          {game.sportCount && (
            <div className="card px-4 py-2">
              <p className="text-2xl font-bold text-white">{game.sportCount}</p>
              <p className="text-xs text-white/40 mt-0.5">Sports</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="px-4 pt-2">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <div className="p-4 sm:p-6">
          {activeTab === 'standings' && (
            <StandingsTab finalStandings={finalStandings} />
          )}
          {activeTab === 'progress' && (
            <ProgressTab gameData={gameData} />
          )}
          {activeTab === 'rosters' && (
            <RostersTab
              gameData={gameData}
              playerMappingsMap={playerMappingsMap}
              gameId={gameId}
            />
          )}
          {activeTab === 'draftlog' && (
            <DraftLogTab draftData={draftData} />
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
