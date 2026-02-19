import { NavLink, Link } from 'react-router-dom'

const navLinks = [
  { to: '/',            label: 'Games'       },
  { to: '/leaderboard', label: 'Leaderboard' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-bg-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white hover:text-accent-blue transition-colors">
          <span className="text-2xl">🏅</span>
          <span>Fantasy Olympics</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150
                ${isActive
                  ? 'bg-accent-blue/15 text-accent-blue'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
