import { useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

export default function SettingsDropdown({ anchorRef, onClose }) {
  const { theme, setTheme } = useTheme()
  const dropdownRef = useRef(null)

  // Close on Escape or click outside (excluding the anchor button)
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    function onClickOutside(e) {
      const clickedDropdown = dropdownRef.current?.contains(e.target)
      const clickedAnchor = anchorRef?.current?.contains(e.target)
      if (!clickedDropdown && !clickedAnchor) onClose()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [onClose, anchorRef])

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-56 z-50 rounded-xl border border-bg-border bg-bg-card shadow-card overflow-hidden"
    >
      {/* Header with X close */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
        <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Settings</p>
        <button
          onClick={onClose}
          className="text-fg-muted hover:text-fg transition-colors leading-none text-base"
          aria-label="Close settings"
        >
          ✕
        </button>
      </div>

      {/* Theme row */}
      <div className="px-4 py-3">
        <p className="text-xs font-medium text-fg-muted mb-2">Appearance</p>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-bg border border-bg-border">
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              theme === 'dark'
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            🌙 Dark
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              theme === 'light'
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            ☀️ Light
          </button>
        </div>
      </div>
    </div>
  )
}
