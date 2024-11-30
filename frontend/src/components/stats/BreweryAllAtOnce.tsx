import React, { useEffect } from 'react'

import type {
  GetBreweryStatsIf,
  BreweryStatsSortingOrder,
  OneBreweryStats,
  StatsFilters
} from '../../core/stats/types'
import type { ListDirection } from '../../core/types'

import BreweryStatsTable from './BreweryStatsTable'

interface Props {
  getBreweryStatsIf: GetBreweryStatsIf
  filters: StatsFilters
  sortingDirection: ListDirection
  sortingOrder: BreweryStatsSortingOrder
  setSortingOrder: (order: BreweryStatsSortingOrder) => void
  breweryId: string | undefined
  styleId: string | undefined
  loadedBreweries: OneBreweryStats[] | undefined
  setLoadedBreweries: (breweries: OneBreweryStats[] | undefined) => void
}

const giantPage = {
  skip: 0,
  size: 10000
}

function BreweryAllAtOnce (props: Props): React.JSX.Element {
  const minReviewCount = props.filters.minReviewCount.value
  const maxReviewCount = props.filters.maxReviewCount.value
  const minReviewAverage = props.filters.minReviewAverage.value
  const maxReviewAverage = props.filters.maxReviewAverage.value
  const {
    loadedBreweries,
    setLoadedBreweries,
    sortingOrder,
    setSortingOrder,
    sortingDirection
  } = props
  const { query, isLoading } = props.getBreweryStatsIf.useStats()
  const breweryId = props.breweryId
  const styleId = props.styleId

  useEffect(() => {
    setLoadedBreweries(undefined)
  }, [breweryId])

  useEffect(() => {
    setLoadedBreweries(undefined)
  }, [styleId])

  useEffect(() => {
    if (loadedBreweries !== undefined) {
      return
    }
    if (isLoading) {
      return
    }
    async function loadAll (): Promise<void> {
      const result = await query({
        breweryId,
        styleId,
        pagination: giantPage,
        sorting: {
          order: sortingOrder,
          direction: sortingDirection
        },
        minReviewCount,
        maxReviewCount,
        minReviewAverage,
        maxReviewAverage
      })
      if (result === undefined) return
      setLoadedBreweries([...result.brewery])
    }
    void loadAll()
  }, [
    breweryId,
    styleId,
    sortingOrder,
    sortingDirection,
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage,
    loadedBreweries
  ])

  return (
    <BreweryStatsTable
      breweries={loadedBreweries ?? []}
      filters={props.filters}
      isLoading={isLoading}
      sortingDirection={props.sortingDirection}
      sortingOrder={props.sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default BreweryAllAtOnce
