import { useEffect, useState } from 'react'
import {
  applyThemeMode,
  getSystemTheme,
  loadThemeMode,
  saveThemeMode,
} from '@src/lib/theme'
import type { EffectiveTheme, ThemeMode } from '@src/lib/theme'

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(() => loadThemeMode())
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>(() => getSystemTheme())

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setSystemTheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  function setMode(next: ThemeMode) {
    setModeState(next)
    applyThemeMode(next)
    saveThemeMode(next)
  }

  const effectiveTheme: EffectiveTheme = mode === 'system' ? systemTheme : mode

  return { mode, setMode, effectiveTheme }
}
