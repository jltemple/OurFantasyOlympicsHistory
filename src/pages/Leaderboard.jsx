import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { GAME_REGISTRY } from '../data/gameRegistry'
import { PLAYER_MAP } from '../data'
import { PLAYER_COLORS } from '../constants/playerColors'
import PageWrapper from '../components/layout/PageWrapper'
import PlayerColorDot from '../components/ui/PlayerColorDot'
import TrophyIcon from '../components/ui/TrophyIcon'

// ── Cumulative chart tooltip ───────────────────────────────────────────────────
function CumulativeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const sorted = [...payload]
    .filter(p => p.value !== null && p.value !== undefined)
    .sort((a, b) => b.value - a.value)

  return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-3 shadow-card text-sm min-w-[200px]">
      <p className="text-white/50 font-medium mb-2">{label}</p>
      {sorted.map(entry => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/80">
              {PLAYER_MAP[entry.dataKey]?.displayName ?? entry.dataKey}
            </span>
          </div>
          <span className="font-semibold text-white tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function CumulativeLegend({ payload }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
      {payload?.map(entry => (
        <div key={entry.dataKey} className="flex items-center gap-1.5 text-xs text-white/60">
          <span
            className="w-3 h-0.5 inline-block rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {PLAYER_MAP[entry.dataKey]?.displayName ?? entry.dataKey}
        </div>
      ))}
    </div>
  )
}

// ── Game result badge in expanded row ─────────────────────────────────────────
function GameResultBadge({ result }) {
  const medalColor =
    result.rank === 1 ? 'text-accent-gold border-accent-gold/30 bg-accent-gold/10'
    : result.rank === 2 ? 'text-accent-silver border-accent-silver/30 bg-accent-silver/10'
    : result.rank === 3 ? 'text-accent-bronze border-accent-bronze/30 bg-accent-bronze/10'
    : 'text-white/50 border-white/10 bg-white/5'

  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-xs ${medalColor}`}>
      <span className="font-medium truncate">{result.gameName}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <TrophyIcon rank={result.rank} />
        <span className="font-semibold tabular-nums">{result.score} pts</span>
      </div>
    </div>
  )
}

// ── Leaderboard table row ──────────────────────────────────────────────────────
function LeaderboardRow({ row, mode, isExpanded, onToggle }) {
  const isTop3 = row.rank <= 3

  return (
    <>
      <tr
        className={`table-row-hover cursor-pointer select-none ${isTop3 ? 'bg-white/[0.02]' : ''} ${isExpanded ? 'bg-white/[0.04]' : ''}`}
        onClick={onToggle}
      >
        {/* Rank */}
        <td className="py-3.5 pl-4 w-12">
          <TrophyIcon rank={row.rank} />
        </td>

        {/* Player */}
        <td className="py-3.5 pl-3">
          <div className="flex items-center gap-2">
            <PlayerColorDot playerId={row.playerId} />
            <span className="font-semibold text-white">{row.displayName}</span>
          </div>
        </td>

        {/* Games played */}
        <td className="py-3.5 pr-4 text-center text-white/50 tabular-nums hidden sm:table-cell">
          {row.gamesPlayed}
        </td>

        {/* Medal counts */}
        <td className="py-3.5 pr-4 text-right text-accent-gold font-medium tabular-nums">
          {row.totalGold}
        </td>
        <td className="py-3.5 pr-4 text-right text-accent-silver font-medium tabular-nums">
          {row.totalSilver}
        </td>
        <td className="py-3.5 pr-4 text-right text-accent-bronze font-medium tabular-nums">
          {row.totalBronze}
        </td>

        {/* Score / pts per event */}
        {mode === 'raw' ? (
          <td className="py-3.5 pr-4 text-right font-bold text-white tabular-nums">
            {row.totalScore}
          </td>
        ) : (
          <td className="py-3.5 pr-4 text-right font-bold text-white tabular-nums">
            {row.ptsPerMedalEvent?.toFixed(2) ?? '—'}
          </td>
        )}

        {/* Expand chevron */}
        <td className="py-3.5 pr-4 text-right w-8">
          <span className={`text-white/25 text-xs transition-transform inline-block ${isExpanded ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </td>
      </tr>

      {/* Expanded game-by-game breakdown */}
      {isExpanded && (
        <tr>
          <td colSpan={8} className="pb-4 px-4 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
              {row.gameResults.map(result => (
                <GameResultBadge key={result.gameId} result={result} />
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const [mode,        setMode]        = useState('raw')        // 'raw' | 'perEvent'
  const [fromGameId,  setFromGameId]  = useState(null)         // null = all time
  const [expandedId,  setExpandedId]  = useState(null)
  const [showChart,   setShowChart]   = useState(true)

  const { rows, cumulativeSeries } = useLeaderboard(fromGameId, mode)

  // All playerIds that appear in the chart
  const chartPlayerIds = useMemo(() => {
    if (!cumulativeSeries.length) return []
    return Object.keys(cumulativeSeries[0]).filter(k => k !== 'gameLabel' && k !== 'gameId')
  }, [cumulativeSeries])

  function toggleExpand(playerId) {
    setExpandedId(prev => (prev === playerId ? null : playerId))
  }

  const selectedGame = GAME_REGISTRY.find(g => g.game.id === fromGameId)

  return (
    <PageWrapper>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
          All-Time Leaderboard
        </h1>
        <p className="text-white/40 text-sm">
          {fromGameId
            ? `Results from ${selectedGame?.game.name ?? fromGameId} onwards`
            : 'Aggregated across all Fantasy Olympics games'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Score mode toggle */}
        <div className="flex items-center bg-bg-card border border-bg-border rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode('raw')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'raw'
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Raw Score
          </button>
          <button
            onClick={() => setMode('perEvent')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'perEvent'
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Pts / Medal Event
          </button>
        </div>

        {/* From game filter */}
        <div className="flex items-center bg-bg-card border border-bg-border rounded-xl overflow-hidden">
          <span className="px-3 text-white/40 text-sm border-r border-bg-border py-2 select-none">
            From
          </span>
          <select
            value={fromGameId ?? ''}
            onChange={e => {
              setFromGameId(e.target.value || null)
              setExpandedId(null)
            }}
            className="bg-transparent text-white text-sm px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none"
            style={{ backgroundImage: 'none' }}
          >
            <option value="">All Time</option>
            {GAME_REGISTRY.map(g => (
              <option key={g.game.id} value={g.game.id}>
                {g.game.hostCity} {g.game.year}
              </option>
            ))}
          </select>
        </div>

        {/* Chart toggle */}
        <button
          onClick={() => setShowChart(v => !v)}
          className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
            showChart
              ? 'bg-white/5 border-white/20 text-white'
              : 'bg-transparent border-bg-border text-white/40 hover:text-white'
          }`}
        >
          {showChart ? '📈 Hide Chart' : '📈 Show Chart'}
        </button>
      </div>

      {/* Cumulative chart */}
      {showChart && cumulativeSeries.length > 0 && (
        <div className="card p-4 sm:p-6 mb-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Cumulative Score Progression
          </h2>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={cumulativeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="gameLabel"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={45}
              />
              <Tooltip content={<CumulativeTooltip />} />
              <Legend content={<CumulativeLegend />} />
              {chartPlayerIds.map(pid => (
                <Line
                  key={pid}
                  type="monotone"
                  dataKey={pid}
                  stroke={PLAYER_COLORS[pid] ?? '#6b7280'}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0, fill: PLAYER_COLORS[pid] ?? '#6b7280' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card px-4 py-3 text-center">
          <p className="text-2xl font-bold text-white">{rows.length}</p>
          <p className="text-xs text-white/40 mt-0.5">Players</p>
        </div>
        <div className="card px-4 py-3 text-center">
          <p className="text-2xl font-bold text-white">
            {fromGameId
              ? GAME_REGISTRY.length - GAME_REGISTRY.findIndex(g => g.game.id === fromGameId)
              : GAME_REGISTRY.length}
          </p>
          <p className="text-xs text-white/40 mt-0.5">Games</p>
        </div>
        <div className="card px-4 py-3 text-center">
          <p className="text-2xl font-bold text-accent-gold">
            {rows.reduce((s, r) => s + r.totalGold, 0)}
          </p>
          <p className="text-xs text-white/40 mt-0.5">Total 🥇</p>
        </div>
        <div className="card px-4 py-3 text-center">
          <p className="text-2xl font-bold text-white">
            {rows.reduce((s, r) => s + r.totalScore, 0)}
          </p>
          <p className="text-xs text-white/40 mt-0.5">Total Score</p>
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="card overflow-hidden">
        {/* Mode description */}
        {mode === 'perEvent' && (
          <div className="px-4 sm:px-6 py-3 border-b border-bg-border bg-accent-blue/5">
            <p className="text-xs text-accent-blue/80">
              <span className="font-semibold">Pts / Medal Event</span> normalizes Summer vs. Winter scale — score ÷ total Olympic medal events at each game played.
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-bg-border">
                <th className="text-left py-3 pl-4 w-12">Rank</th>
                <th className="text-left py-3 pl-3">Player</th>
                <th className="text-center py-3 pr-4 hidden sm:table-cell">Games</th>
                <th className="text-right py-3 pr-4">🥇</th>
                <th className="text-right py-3 pr-4">🥈</th>
                <th className="text-right py-3 pr-4">🥉</th>
                <th className="text-right py-3 pr-4 font-semibold">
                  {mode === 'raw' ? 'Score' : 'Pts/Event'}
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {rows.map(row => (
                <LeaderboardRow
                  key={row.playerId}
                  row={row}
                  mode={mode}
                  isExpanded={expandedId === row.playerId}
                  onToggle={() => toggleExpand(row.playerId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-white/25 text-center mt-6">
        Click any row to see per-game breakdown · Summer Games score ~3× Winter due to more medal events
      </p>
    </PageWrapper>
  )
}
