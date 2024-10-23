import { useEffect, useState } from 'react'

import { invertDirection } from '../list-helpers'
import type {
  GetBreweryStatsIf,
  BreweryStatsSortingOrder,
  OneBreweryStats
} from '../../core/stats/types'
import type {
  ListDirection,
  Pagination
} from '../../core/types'
import { infiniteScroll } from '../util'

import BreweryStatsTable from './BreweryStatsTable'

import './Stats.css'

const pageSize = 30

interface Props {
  getBreweryStatsIf: GetBreweryStatsIf
  breweryId: string | undefined
  styleId: string | undefined
}

interface TriggerParams {
  breweryId: string | undefined
  styleId: string | undefined
  pagination: Pagination
  minReviewCount: number
  maxReviewCount: number
  minReviewAverage: number
  maxReviewAverage: number
}

const giantPage = {
  skip: 0,
  size: 10000
}

function Brewery (props: Props): JSX.Element {
  const [
    sortingOrder,
    setSortingOrder
  ] = useState<BreweryStatsSortingOrder>('brewery_name')
  const [
    sortingDirection,
    setSortingDirection
  ] = useState<ListDirection>('asc')
  const [minReviewCount, doSetMinReviewCount] = useState(1)
  const [maxReviewCount, doSetMaxReviewCount] = useState(Infinity)
  const [minReviewAverage, doSetMinReviewAverage] = useState(4)
  const [maxReviewAverage, doSetMaxReviewAverage] = useState(10)
  const { query, stats, isLoading } = props.getBreweryStatsIf.useStats()
  const [loadedBreweries, setLoadedBreweries] =
    useState<OneBreweryStats[] | undefined>(undefined)
  const breweryId = props.breweryId
  const styleId = props.styleId
  const [breweryIdTriggerParams, setBreweryIdTriggerParams] =
  useState<TriggerParams>({
    breweryId,
    styleId,
    pagination: giantPage,
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage
  })

  function setMinReviewCount (minReviewCount: number): void {
    doSetMinReviewCount(minReviewCount)
    setLoadedBreweries(undefined)
  }

  function setMaxReviewCount (maxReviewCount: number): void {
    doSetMaxReviewCount(maxReviewCount)
    setLoadedBreweries(undefined)
  }

  function setMinReviewAverage (minReviewAverage: number): void {
    doSetMinReviewAverage(minReviewAverage)
    setLoadedBreweries(undefined)
  }

  function setMaxReviewAverage (maxReviewAverage: number): void {
    doSetMaxReviewAverage(maxReviewAverage)
    setLoadedBreweries(undefined)
  }

  useEffect(() => {
    setLoadedBreweries(undefined)
  }, [breweryId])

  useEffect(() => {
    setLoadedBreweries(undefined)
  }, [styleId])

  useEffect(() => {
    setBreweryIdTriggerParams({
      breweryId,
      styleId,
      pagination: giantPage,
      minReviewCount,
      maxReviewCount,
      minReviewAverage,
      maxReviewAverage
    })
  }, [
    breweryId,
    styleId,
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage
  ])

  const breweryArray = stats?.brewery === undefined
    ? []
    : [...stats.brewery]
  const hasMore = breweryArray.length > 0 || loadedBreweries === undefined

  useEffect(() => {
    if (breweryId === undefined && styleId === undefined) {
      return
    }
    if (loadedBreweries !== undefined) {
      return
    }
    if (isLoading) {
      return
    }
    async function loadAll (): Promise<void> {
      const result = await query({
        ...breweryIdTriggerParams,
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
    sortingOrder,
    sortingDirection,
    breweryIdTriggerParams,
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage,
    loadedBreweries
  ])

  useEffect(() => {
    if (breweryId !== undefined || styleId !== undefined) {
      return
    }
    const loadMore = async (): Promise<void> => {
      const result = await query({
        breweryId: props.breweryId,
        styleId: props.styleId,
        pagination: {
          skip: loadedBreweries?.length ?? 0,
          size: pageSize
        },
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
      const newBreweries = [...(loadedBreweries ?? []), ...result.brewery]
      setLoadedBreweries(newBreweries)
    }
    function checkLoad (): void {
      if (!isLoading && hasMore) {
        void loadMore()
      }
    }
    return infiniteScroll(checkLoad)
  }, [
    breweryId,
    styleId,
    loadedBreweries,
    setLoadedBreweries,
    isLoading,
    hasMore,
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage,
    sortingOrder,
    sortingDirection,
    query
  ])

  function isSelected (property: BreweryStatsSortingOrder): boolean {
    return sortingOrder === property
  }

  function changeSortingOrder (property: BreweryStatsSortingOrder) {
    setLoadedBreweries(undefined)
    if (isSelected(property)) {
      setSortingDirection(invertDirection(sortingDirection))
      return
    }
    setSortingOrder(property)
    setSortingDirection(property === 'brewery_name' ? 'asc' : 'desc')
  }

  return (
    <BreweryStatsTable
      breweries={loadedBreweries ?? []}
      filters={{
        minReviewCount: {
          value: minReviewCount,
          setValue: setMinReviewCount
        },
        maxReviewCount: {
          value: maxReviewCount,
          setValue: setMaxReviewCount
        },
        minReviewAverage: {
          value: minReviewAverage,
          setValue: setMinReviewAverage
        },
        maxReviewAverage: {
          value: maxReviewAverage,
          setValue: setMaxReviewAverage
        }
      }}
      isLoading={isLoading}
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={changeSortingOrder}
    />
  )
}

export default Brewery
