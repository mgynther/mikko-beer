import { fireEvent, render, waitFor } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import { setupUser } from '../../../../test-util/user-event'
import { testTimes } from '../../../../test-util/filter-time'
import BreweryCountryInfiniteScroll from './BreweryCountryInfiniteScroll'
import { openFilters } from '../../../../test-util/open-filters'
import type {
  BreweryCountryStats,
  BreweryCountryStatsSortingOrder,
  GetBreweryCountryStatsIf,
  OneBreweryCountryStats,
} from '../../types/stats/types'
import type { UseDebounce, YearMonth } from '../../types/types'
import type { StatsFilters } from './filter-types'
import { dontCall } from '../../../../test-util/dont-call'
import { updatedItems } from '../../../../test-util/load-more'
import type { FormattedStatsParams } from './search-params'

const finland: OneBreweryCountryStats = {
  countryCode: 'FI',
  breweryCount: '13',
  reviewAverage: '9.06',
  reviewCount: '63',
  reviewMedian: '9.00',
  reviewMode: '9',
  reviewStandardDeviation: '0.35',
  reviewedBeerCount: '62',
}

const estonia: OneBreweryCountryStats = {
  countryCode: 'EE',
  breweryCount: '4',
  reviewAverage: '9.71',
  reviewCount: '24',
  reviewMedian: '9.50',
  reviewMode: '10',
  reviewStandardDeviation: '0.67',
  reviewedBeerCount: '24',
}

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const unusedFilters: StatsFilters = {
  minReviewCount: {
    value: 1,
    setValue: dontCall,
  },
  maxReviewCount: {
    value: Infinity,
    setValue: dontCall,
  },
  minReviewAverage: {
    value: 4.0,
    setValue: dontCall,
  },
  maxReviewAverage: {
    value: 10.0,
    setValue: dontCall,
  },
  timeStart: {
    min: minTime,
    max: maxTime,
    value: minTime,
    setValue: dontCall,
  },
  timeEnd: {
    min: minTime,
    max: maxTime,
    value: maxTime,
    setValue: dontCall,
  },
}

const statsParams: FormattedStatsParams<BreweryCountryStatsSortingOrder> = {
  sortingOrder: 'country_code',
  sortingDirection: 'asc',
  minReviewCount: 1,
  maxReviewCount: Infinity,
  minReviewAverage: 4.0,
  maxReviewAverage: 10.0,
  timeStart: testTimes.min.utcTimestamp,
  timeEnd: testTimes.max.utcTimestamp,
  isFiltersOpen: false,
}

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const unusedStats: GetBreweryCountryStatsIf = {
  useStats: () => ({
    query: async () => ({ breweryCountry: [] }),
    stats: { breweryCountry: [] },
    isLoading: false,
  }),
  infiniteScroll: () => () => undefined,
  minTime,
  maxTime,
  getUseDebounce,
}

test('queries brewery country stats', async () => {
  const query = vitest.fn()
  const setLoadedBreweryCountries = vitest.fn()
  let loadCallback: () => void = () => undefined
  const getBreweryCountryStatsIf: GetBreweryCountryStatsIf = {
    useStats: () => ({
      query: async (params): Promise<BreweryCountryStats> => {
        query(params)
        return {
          breweryCountry: [{ ...finland }, { ...estonia }],
        }
      },
      stats: {
        breweryCountry: [],
      },
      isLoading: false,
    }),
    infiniteScroll: (cb) => {
      loadCallback = cb
      return () => undefined
    },
    minTime,
    maxTime,
    getUseDebounce,
  }
  render(
    <BreweryCountryInfiniteScroll
      getBreweryCountryStatsIf={getBreweryCountryStatsIf}
      loadedBreweryCountries={undefined}
      setLoadedBreweryCountries={setLoadedBreweryCountries}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: () => undefined,
      }}
      isFilterChangePending={false}
      statsParams={statsParams}
    />,
  )
  expect(query.mock.calls).toEqual([])
  loadCallback()
  expect(query.mock.calls).toEqual([
    [
      {
        breweryId: undefined,
        locationId: undefined,
        maxReviewAverage: unusedFilters.maxReviewAverage.value,
        maxReviewCount: unusedFilters.maxReviewCount.value,
        minReviewAverage: unusedFilters.minReviewAverage.value,
        minReviewCount: unusedFilters.minReviewCount.value,
        pagination: {
          size: 30,
          skip: 0,
        },
        sorting: {
          direction: 'asc',
          order: 'country_code',
        },
        styleId: undefined,
        timeStart: testTimes.min.utcTimestamp,
        timeEnd: testTimes.max.utcTimestamp,
      },
    ],
  ])
  await waitFor(() => {
    expect(
      updatedItems(setLoadedBreweryCountries.mock.calls, undefined),
    ).toEqual([[finland, estonia]])
  })
})

test('queries the next page after the loaded ones', async () => {
  const query = vitest.fn()
  const setLoadedBreweryCountries = vitest.fn()
  let loadCallback: () => void = () => undefined
  render(
    <BreweryCountryInfiniteScroll
      getBreweryCountryStatsIf={{
        ...unusedStats,
        useStats: () => ({
          query: async (params): Promise<BreweryCountryStats> => {
            query(params)
            return { breweryCountry: [{ ...estonia }] }
          },
          stats: {
            breweryCountry: [{ ...finland }],
          },
          isLoading: false,
        }),
        infiniteScroll: (cb) => {
          loadCallback = cb
          return (): undefined => undefined
        },
      }}
      loadedBreweryCountries={[finland]}
      setLoadedBreweryCountries={setLoadedBreweryCountries}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: dontCall,
      }}
      isFilterChangePending={false}
      statsParams={statsParams}
    />,
  )
  loadCallback()
  expect(query.mock.calls).toEqual([
    [
      {
        breweryId: undefined,
        locationId: undefined,
        maxReviewAverage: unusedFilters.maxReviewAverage.value,
        maxReviewCount: unusedFilters.maxReviewCount.value,
        minReviewAverage: unusedFilters.minReviewAverage.value,
        minReviewCount: unusedFilters.minReviewCount.value,
        pagination: {
          size: 30,
          skip: 1,
        },
        sorting: {
          direction: 'asc',
          order: 'country_code',
        },
        styleId: undefined,
        timeStart: testTimes.min.utcTimestamp,
        timeEnd: testTimes.max.utcTimestamp,
      },
    ],
  ])
  await waitFor(() => {
    expect(
      updatedItems(setLoadedBreweryCountries.mock.calls, [finland]),
    ).toEqual([[finland, estonia]])
  })
})

test('renders brewery country stats', () => {
  const { getByText } = render(
    <BreweryCountryInfiniteScroll
      getBreweryCountryStatsIf={unusedStats}
      loadedBreweryCountries={[finland, estonia]}
      setLoadedBreweryCountries={() => undefined}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: dontCall,
      }}
      isFilterChangePending={false}
      statsParams={statsParams}
    />,
  )
  getByText(finland.countryCode)
  getByText(finland.breweryCount)
  getByText(finland.reviewAverage)
  getByText(`${finland.reviewCount} (${finland.reviewedBeerCount})`)
  getByText(finland.reviewMedian)
  getByText(finland.reviewMode)
  getByText(finland.reviewStandardDeviation)
  getByText(estonia.countryCode)
  getByText(estonia.breweryCount)
  getByText(estonia.reviewAverage)
  getByText(estonia.reviewCount)
  getByText(estonia.reviewMedian)
  getByText(estonia.reviewMode)
  getByText(estonia.reviewStandardDeviation)
})

test('renders loading', () => {
  const { getAllByRole } = render(
    <BreweryCountryInfiniteScroll
      getBreweryCountryStatsIf={{
        ...unusedStats,
        useStats: () => ({
          query: dontCall,
          stats: undefined,
          isLoading: true,
        }),
      }}
      loadedBreweryCountries={undefined}
      setLoadedBreweryCountries={() => undefined}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: dontCall,
      }}
      isFilterChangePending={false}
      statsParams={statsParams}
    />,
  )
  const cells = getAllByRole('cell')
  expect(cells.length).toEqual(7 * 3)
})

test('does not try to load more when there is no more', () => {
  let loadCallback: () => void = () => undefined
  const query = vitest.fn()
  render(
    <BreweryCountryInfiniteScroll
      getBreweryCountryStatsIf={{
        ...unusedStats,
        useStats: () => ({
          query: query,
          stats: {
            breweryCountry: [],
          },
          isLoading: false,
        }),
        infiniteScroll: (cb) => {
          loadCallback = cb
          return (): undefined => undefined
        },
      }}
      loadedBreweryCountries={[]}
      setLoadedBreweryCountries={() => undefined}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: dontCall,
      }}
      isFilterChangePending={false}
      statsParams={statsParams}
    />,
  )
  loadCallback()
  expect(query.mock.calls).toEqual([])
})

test('does not try to load more when loading', () => {
  let loadCallback: () => void = () => undefined
  const query = vitest.fn()
  render(
    <BreweryCountryInfiniteScroll
      getBreweryCountryStatsIf={{
        ...unusedStats,
        useStats: () => ({
          query: query,
          stats: {
            breweryCountry: [],
          },
          isLoading: true,
        }),
        infiniteScroll: (cb) => {
          loadCallback = cb
          return (): undefined => undefined
        },
      }}
      loadedBreweryCountries={undefined}
      setLoadedBreweryCountries={() => undefined}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: dontCall,
      }}
      isFilterChangePending={false}
      statsParams={statsParams}
    />,
  )
  loadCallback()
  expect(query.mock.calls).toEqual([])
})

test('sets minimum review count filter', () => {
  const setMinimumReviewAverage = vitest.fn()
  const { getByDisplayValue } = render(
    <BreweryCountryInfiniteScroll
      getBreweryCountryStatsIf={unusedStats}
      loadedBreweryCountries={[finland, estonia]}
      setLoadedBreweryCountries={() => undefined}
      setSortingOrder={() => undefined}
      filterState={{
        filters: {
          ...unusedFilters,
          minReviewAverage: {
            value: 4.0,
            setValue: setMinimumReviewAverage,
          },
        },
        isOpen: true,
        setIsOpen: dontCall,
      }}
      isFilterChangePending={false}
      statsParams={statsParams}
    />,
  )
  const slider = getByDisplayValue('4')
  fireEvent.change(slider, { target: { value: '4.5' } })
  expect(setMinimumReviewAverage.mock.calls).toEqual([[4.5]])
})

test('opens filters', async () => {
  const user = setupUser()
  const setIsFiltersOpen = vitest.fn()
  const { getByRole } = render(
    <BreweryCountryInfiniteScroll
      getBreweryCountryStatsIf={unusedStats}
      loadedBreweryCountries={[finland, estonia]}
      setLoadedBreweryCountries={() => undefined}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: setIsFiltersOpen,
      }}
      isFilterChangePending={false}
      statsParams={statsParams}
    />,
  )
  await openFilters(getByRole, user)
  expect(setIsFiltersOpen.mock.calls).toEqual([[true]])
})
