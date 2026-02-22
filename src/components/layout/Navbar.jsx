import { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

const navLinks = [
  { to: '/',            label: 'Games'       },
  { to: '/leaderboard', label: 'Leaderboard' },
]

function SettingsDropdown({ onClose, anchorRef }) {
  const { theme, setTheme } = useTheme()
  const dropdownRef = useRef(null)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    function onDown(e) {
      if (!dropdownRef.current?.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [onClose, anchorRef])

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-52 z-50 rounded-xl border border-bg-border bg-bg-card shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Settings</p>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors text-sm leading-none"
          aria-label="Close"
        >✕</button>
      </div>

      {/* Theme toggle */}
      <div className="px-4 py-3">
        <p className="text-xs font-medium text-white/50 mb-2">Appearance</p>
        <div className="flex gap-1 p-1 rounded-lg bg-bg border border-bg-border">
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              theme === 'dark' ? 'bg-accent-blue/20 text-accent-blue' : 'text-white/50 hover:text-white'
            }`}
          >🌙 Dark</button>
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              theme === 'light' ? 'bg-accent-blue/20 text-accent-blue' : 'text-white/50 hover:text-white'
            }`}
          >☀️ Light</button>
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const [showSettings, setShowSettings] = useState(false)
  const gearRef = useRef(null)

  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-bg-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white hover:text-accent-blue transition-colors min-w-0">
          <span className="text-2xl flex-shrink-0">🏅</span>
          <span className="truncate">Marcus' Fantasy Olympics</span>
        </Link>

        {/* Nav + gear */}
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

          {/* Gear button + dropdown */}
          <div className="relative ml-1">
            <button
              ref={gearRef}
              onClick={() => setShowSettings(v => !v)}
              className={`p-1.5 rounded-lg transition-colors ${
                showSettings ? 'text-white bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            {showSettings && (
              <SettingsDropdown anchorRef={gearRef} onClose={() => setShowSettings(false)} />
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
