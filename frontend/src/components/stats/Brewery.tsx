import { useState } from 'react'

import type {
  BreweryStatsSortingOrder,
  GetBreweryStatsIf,
  OneBreweryStats
} from '../../core/stats/types'
import type { ListDirection } from '../../core/types'

import { invertDirection } from '../list-helpers'

import BreweryAllAtOnce from './BreweryAllAtOnce'
import BreweryInfiniteScroll from './BreweryInfiniteScroll'

import './Stats.css'

interface Props {
  getBreweryStatsIf: GetBreweryStatsIf
  breweryId: string | undefined
  styleId: string | undefined
}

function Brewery (props: Props): JSX.Element {
  const isAllAtOnce =
    props.breweryId !== undefined || props.styleId !== undefined

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
  const [loadedBreweries, setLoadedBreweries] =
    useState<OneBreweryStats[] | undefined>(undefined)

  function getFilterSetter(setter: (value: number) => void) {
    return (value: number) => {
      setter(value)
      setLoadedBreweries(undefined)
    }
  }

  const setMinReviewCount = getFilterSetter(doSetMinReviewCount)
  const setMaxReviewCount = getFilterSetter(doSetMaxReviewCount)
  const setMinReviewAverage = getFilterSetter(doSetMinReviewAverage)
  const setMaxReviewAverage = getFilterSetter(doSetMaxReviewAverage)

  const filters = {
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
  }

  function changeSortingOrder (property: BreweryStatsSortingOrder) {
    setLoadedBreweries(undefined)
    if (sortingOrder === property) {
      setSortingDirection(invertDirection(sortingDirection))
      return
    }
    setSortingOrder(property)
    setSortingDirection(property === 'brewery_name' ? 'asc' : 'desc')
  }

  return (
    <>
      {isAllAtOnce && (
        <BreweryAllAtOnce
          getBreweryStatsIf={props.getBreweryStatsIf}
          filters={filters}
          loadedBreweries={loadedBreweries}
          setLoadedBreweries={setLoadedBreweries}
          sortingDirection={sortingDirection}
          sortingOrder={sortingOrder}
          setSortingOrder={changeSortingOrder}
          breweryId={props.breweryId}
          styleId={props.styleId}
        />
      )}
      {!isAllAtOnce && (
        <BreweryInfiniteScroll
          getBreweryStatsIf={props.getBreweryStatsIf}
          filters={filters}
          loadedBreweries={loadedBreweries}
          setLoadedBreweries={setLoadedBreweries}
          sortingDirection={sortingDirection}
          sortingOrder={sortingOrder}
          setSortingOrder={changeSortingOrder}
        />
      )}
    </>
  )
}

export default Brewery
