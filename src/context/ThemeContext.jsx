import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext(null)

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
  localStorage.setItem('theme', theme)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') ?? 'dark'
    applyTheme(saved)
    return saved
  })

  function handleSetTheme(next) {
    applyTheme(next)
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
