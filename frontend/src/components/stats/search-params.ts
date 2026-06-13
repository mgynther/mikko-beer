import { useEffect, useState } from 'react'
import type { SearchParameters } from '../util'
import type { StatsFilters, YearMonth } from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'
import type { ParsedStatsParams, SearchRecord } from './filter-util'
import {
  averageStr,
  countStr,
  filtersOpenStr,
  formatToSearch,
  formatYearMonth,
  parseFromSearch,
} from './filter-util'
import { invertDirection } from '../list-helpers'

interface Props<T extends string> {
  nameProperty: string
  search: SearchParameters
  minTime: YearMonth
  maxTime: YearMonth
  getUseDebounce: <T>() => UseDebounce<T>
  sortingOrderParser: (search: SearchParameters | undefined) => T
  setState: (state: SearchRecord) => void
}

interface Result<T extends string> {
  searchString: string
  changeSortingOrder: (order: T) => void
  isFilterChangePending: boolean
  setIsFiltersOpen: (isOpen: boolean) => void
  statsParams: ParsedStatsParams<T>
  filters: StatsFilters
}

export function searchParams<T extends string>(props: Props<T>): Result<T> {
  const { search } = props
  const [searchMap, setSearchMap] = useState<SearchRecord | undefined>(
    undefined,
  )
  const [debouncedSearchMap, isFilterChangePending] = props.getUseDebounce<
    SearchRecord | undefined
  >()(searchMap)
  const statsParams = parseFromSearch(
    search,
    props.minTime,
    props.maxTime,
    props.sortingOrderParser,
  )

  function getCurrentState(): SearchRecord {
    return formatToSearch(statsParams)
  }

  function getFilterSetter(
    key: keyof SearchRecord,
    converter: (value: number) => string,
  ) {
    return (value: number) => {
      const newState: SearchRecord = getCurrentState()
      newState[key] = converter(value)
      setSearchMap(newState)
    }
  }

  function getYearMonthSetter(
    key: keyof SearchRecord,
    converter: (yearMonth: YearMonth) => string,
  ) {
    return (yearMonth: YearMonth) => {
      const newState: SearchRecord = getCurrentState()
      newState[key] = converter(yearMonth)
      setSearchMap(newState)
    }
  }

  const setMinReviewCount = getFilterSetter('min_review_count', countStr)
  const setMaxReviewCount = getFilterSetter('max_review_count', countStr)
  const setMinReviewAverage = getFilterSetter('min_review_average', averageStr)
  const setMaxReviewAverage = getFilterSetter('max_review_average', averageStr)
  const setTimeStart = getYearMonthSetter('time_start', formatYearMonth)
  const setTimeEnd = getYearMonthSetter('time_end', formatYearMonth)

  function setIsFiltersOpen(isOpen: boolean): void {
    const newState: SearchRecord = getCurrentState()
    newState.filters_open = filtersOpenStr(isOpen)
    props.setState(newState)
  }

  const filters: StatsFilters = {
    minReviewCount: {
      value: statsParams.minReviewCount,
      setValue: setMinReviewCount,
    },
    maxReviewCount: {
      value: statsParams.maxReviewCount,
      setValue: setMaxReviewCount,
    },
    minReviewAverage: {
      value: statsParams.minReviewAverage,
      setValue: setMinReviewAverage,
    },
    maxReviewAverage: {
      value: statsParams.maxReviewAverage,
      setValue: setMaxReviewAverage,
    },
    timeStart: {
      min: props.minTime,
      max: props.maxTime,
      value: statsParams.timeStart,
      setValue: setTimeStart,
    },
    timeEnd: {
      min: props.minTime,
      max: props.maxTime,
      value: statsParams.timeEnd,
      setValue: setTimeEnd,
    },
  }

  const searchString = JSON.stringify({
    filters,
    sortingDirection: statsParams.sortingDirection,
    sortingOrder: statsParams.sortingOrder,
  })
  useEffect(() => {
    if (debouncedSearchMap) {
      props.setState(debouncedSearchMap)
    }
  }, [JSON.stringify(debouncedSearchMap)])

  function changeSortingOrder(property: T): void {
    if (statsParams.sortingOrder === property) {
      props.setState({
        ...getCurrentState(),
        list_direction: invertDirection(statsParams.sortingDirection),
      })
      return
    }
    const direction = property === props.nameProperty ? 'asc' : 'desc'
    props.setState({
      ...getCurrentState(),
      sorting_order: property,
      list_direction: direction,
    })
  }

  return {
    searchString,
    changeSortingOrder,
    isFilterChangePending,
    setIsFiltersOpen,
    statsParams,
    filters,
  }
}
