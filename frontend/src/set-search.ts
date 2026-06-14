import React, { useEffect } from 'react'
import type { NavigateIf } from './navigation'

type Stats = (mode: string, state: Record<string, string>) => void

interface Result {
  stats: Stats
}

export function createSetSearch(
  pathname: string,
  navigateIf: NavigateIf,
): Result {
  const navigate = navigateIf.useNavigate()
  const [storedMode, setStoredMode] = React.useState('')
  const [storedState, setStoredState] = React.useState<Record<string, string>>(
    {},
  )
  async function doNavigate(): Promise<void> {
    if (storedMode === '') {
      return
    }
    const stateParts = Object.keys(storedState).map(
      (key) => `${key}=${storedState[key]}`,
    )
    const baseSearch = `?stats=${storedMode}`
    const allParts = [baseSearch, ...stateParts]
    const newSearch = allParts.join('&')
    await navigate(newSearch, { replace: true })
  }
  useEffect(() => {
    setStoredMode('')
    setStoredState({})
  }, [pathname])
  useEffect(() => void doNavigate(), [storedMode, JSON.stringify(storedState)])
  return {
    stats: (mode: string, state: Record<string, string>): void => {
      setStoredMode(mode)
      setStoredState(state)
    },
  }
}
