import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { PLAYER_COLORS } from '../../constants/playerColors'
import { PLAYER_MAP } from '../../data'
import { buildProgressSeries } from '../../utils/standings'
import { useTheme } from '../../context/ThemeContext'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const sorted = [...payload]
    .filter(p => p.value !== null)
    .sort((a, b) => b.value - a.value)

  return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-3 shadow-card text-sm min-w-[180px]">
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
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function CustomLegend({ payload, tickColor }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
      {payload?.map(entry => (
        <div key={entry.dataKey} className="flex items-center gap-1.5 text-xs" style={{ color: tickColor }}>
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

export default function ProgressLineChart({ gameData, height = 400 }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const tickColor  = isLight ? 'rgba(15,23,42,0.5)'  : 'rgba(255,255,255,0.4)'
  const gridColor  = isLight ? 'rgba(0,0,0,0.06)'    : 'rgba(255,255,255,0.05)'
  const axisColor  = isLight ? 'rgba(0,0,0,0.1)'     : 'rgba(255,255,255,0.1)'

  const series = buildProgressSeries(gameData)
  if (!series.length) return (
    <p className="text-white/40 text-center py-12">No snapshot data available.</p>
  )

  const playerIds = Object.keys(series[0]).filter(k => k !== 'dayLabel' && k !== 'date')

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="dayLabel"
          tick={{ fill: tickColor, fontSize: 12 }}
          axisLine={{ stroke: axisColor }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: tickColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend tickColor={tickColor} />} />
        {playerIds.map(pid => (
          <Line
            key={pid}
            type="monotone"
            dataKey={pid}
            stroke={PLAYER_COLORS[pid] ?? '#6b7280'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
