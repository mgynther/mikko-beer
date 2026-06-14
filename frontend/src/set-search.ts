import React, { useEffect } from 'react'
import type { NavigateIf } from './navigation'

type ReviewList = (state: Record<string, string>) => void
type Stats = (mode: string, state: Record<string, string>) => void

interface Result {
  reviewList: ReviewList
  stats: Stats
}

function formatRecord(record: Record<string, string>): string[] {
  return Object.keys(record).map((key) => `${key}=${record[key]}`)
}

export function createSetSearch(
  pathname: string,
  navigateIf: NavigateIf,
): Result {
  const navigate = navigateIf.useNavigate()
  const [storedStatsMode, setStoredStatsMode] = React.useState('')
  const [storedStatsState, setStoredStatsState] = React.useState<
    Record<string, string>
  >({})
  const [storedReviewListState, setStoredReviewListState] = React.useState<
    Record<string, string>
  >({})

  function getStatsSearch(): string[] {
    if (storedStatsMode === '') {
      return []
    }
    const stateParts = formatRecord(storedStatsState)
    const baseSearch = `stats=${storedStatsMode}`
    return [baseSearch, ...stateParts]
  }

  async function doNavigate(): Promise<void> {
    const statsSearch = getStatsSearch()
    const reviewListSearch = formatRecord(storedReviewListState)
    const allParts = [...statsSearch, ...reviewListSearch]
    const search = allParts.join('&')
    if (search === '') {
      return
    }
    await navigate(`?${search}`, { replace: true })
  }

  useEffect(() => {
    setStoredReviewListState({})
    setStoredStatsMode('')
    setStoredStatsState({})
  }, [pathname])

  useEffect(
    () => void doNavigate(),
    [
      JSON.stringify(storedReviewListState),
      storedStatsMode,
      JSON.stringify(storedStatsState),
    ],
  )

  return {
    reviewList: (state: Record<string, string>): void => {
      setStoredReviewListState(state)
    },
    stats: (mode: string, state: Record<string, string>): void => {
      setStoredStatsMode(mode)
      setStoredStatsState(state)
    },
  }
}
