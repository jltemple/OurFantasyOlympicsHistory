export default function TrophyIcon({ rank, className = '' }) {
  if (rank === 1) return <span className={`text-accent-gold ${className}`}>🏆</span>
  if (rank === 2) return <span className={`text-accent-silver ${className}`}>🥈</span>
  if (rank === 3) return <span className={`text-accent-bronze ${className}`}>🥉</span>
  return <span className={`text-white/30 tabular-nums ${className}`}>{rank}</span>
}
