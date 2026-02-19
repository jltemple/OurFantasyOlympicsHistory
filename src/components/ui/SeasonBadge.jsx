export default function SeasonBadge({ season, className = '' }) {
  const isSummer = season === 'Summer'
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
        ${isSummer
          ? 'bg-amber-500/15 text-amber-400'
          : 'bg-sky-500/15 text-sky-400'
        }
        ${className}
      `}
    >
      {isSummer ? '☀️' : '❄️'} {season}
    </span>
  )
}
