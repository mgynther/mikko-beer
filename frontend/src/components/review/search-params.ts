import { useEffect, useState } from 'react'
import type { SearchParameters, UseDebounce, YearMonth } from '../../core/types'
import type { ParsedReviewListParams, SearchRecord } from './filter-util'
import {
  ratingStr,
  filtersOpenStr,
  formatToSearch,
  parseFromSearch,
} from './filter-util'
import { invertDirection } from '../list-helpers'
import type { ReviewFilters } from './filter-types'
import { formatYearMonth, toTimestamp } from '../common/filter-util'
import type { ReviewSorting, ReviewSortingOrder } from '../../core/review/types'

export interface Props {
  initialSorting: ReviewSorting
  searchParams: SearchParameters
  minTime: YearMonth
  maxTime: YearMonth
  getUseDebounce: <T>() => UseDebounce<T>
  setState: (state: SearchRecord) => void
}

interface Result {
  // Only for detecting changes. Never try to parse.
  changeDetectionString: string
  changeSortingOrder: (order: ReviewSortingOrder) => void
  isFilterChangePending: boolean
  setIsFiltersOpen: (isOpen: boolean) => void
  reviewListParams: ParsedReviewListParams
  filters: ReviewFilters
  minTime: number
  maxTime: number
}

export function parseSearchParams(props: Props): Result {
  const { searchParams: searchParameters } = props
  const [searchMap, setSearchMap] = useState<SearchRecord | undefined>(
    undefined,
  )
  const [debouncedSearchMap, isFilterChangePending] = props.getUseDebounce<
    SearchRecord | undefined
  >()(searchMap)
  const reviewListParams = parseFromSearch(
    searchParameters,
    props.initialSorting,
    props.minTime,
    props.maxTime,
  )

  function getCurrentState(): SearchRecord {
    return formatToSearch(reviewListParams)
  }

  useEffect(() => {
    const newState: SearchRecord = getCurrentState()
    // Initial setter needed for reload.
    props.setState(newState)
  }, [])

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

  const setMinRating = getFilterSetter('r_min_rating', ratingStr)
  const setMaxRating = getFilterSetter('r_max_rating', ratingStr)
  const setMinTime = getYearMonthSetter('r_min_time', formatYearMonth)
  const setMaxTime = getYearMonthSetter('r_max_time', formatYearMonth)

  function setIsFiltersOpen(isOpen: boolean): void {
    const newState: SearchRecord = getCurrentState()
    newState.r_filters = filtersOpenStr(isOpen)
    props.setState(newState)
  }

  const filters: ReviewFilters = {
    minRating: {
      value: reviewListParams.minReviewRating,
      setValue: setMinRating,
    },
    maxRating: {
      value: reviewListParams.maxReviewRating,
      setValue: setMaxRating,
    },
    minTime: {
      min: props.minTime,
      max: props.maxTime,
      value: reviewListParams.minTime,
      setValue: setMinTime,
    },
    maxTime: {
      min: props.minTime,
      max: props.maxTime,
      value: reviewListParams.maxTime,
      setValue: setMaxTime,
    },
  }

  const changeDetectionString = JSON.stringify({
    filters,
    sortingDirection: reviewListParams.sortingDirection,
    sortingOrder: reviewListParams.sortingOrder,
  })
  useEffect(() => {
    if (debouncedSearchMap) {
      props.setState(debouncedSearchMap)
    }
  }, [JSON.stringify(debouncedSearchMap)])

  function changeSortingOrder(property: ReviewSortingOrder): void {
    if (reviewListParams.sortingOrder === property) {
      props.setState({
        ...getCurrentState(),
        r_direction: invertDirection(reviewListParams.sortingDirection),
      })
      return
    }
    const direction = property === 'beer_name' ? 'asc' : 'desc'
    props.setState({
      ...getCurrentState(),
      r_order: property,
      r_direction: direction,
    })
  }

  return {
    changeDetectionString,
    changeSortingOrder,
    isFilterChangePending,
    setIsFiltersOpen,
    reviewListParams,
    filters,
    minTime: toTimestamp(reviewListParams.minTime, 'start'),
    maxTime: toTimestamp(reviewListParams.maxTime, 'end'),
  }
}
