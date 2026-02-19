const CONFIG = {
  gold:   { emoji: '🥇', color: 'text-accent-gold',   bg: 'bg-accent-gold/10'   },
  silver: { emoji: '🥈', color: 'text-accent-silver', bg: 'bg-accent-silver/10' },
  bronze: { emoji: '🥉', color: 'text-accent-bronze', bg: 'bg-accent-bronze/10' },
}

export default function MedalBadge({ type, count }) {
  const { emoji, color, bg } = CONFIG[type] ?? CONFIG.bronze
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-medium ${color} ${bg}`}>
      {emoji} {count}
    </span>
  )
}
