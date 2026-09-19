import { fireEvent, render, waitFor } from '@testing-library/react'
import { setupUser } from '../../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../../test-util/filter-time'
import BreweryCountryAllAtOnce from './BreweryCountryAllAtOnce'
import { openFilters } from '../../../../test-util/open-filters'
import type {
  BreweryCountryStats,
  BreweryCountryStatsSortingOrder,
  GetBreweryCountryStatsIf,
  OneBreweryCountryStats,
} from '../../types/stats/types'
import type { UseDebounce, YearMonth } from '../../types/types'
import { dontCall } from '../../../../test-util/dont-call'
import type { FormattedStatsParams } from './search-params'

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const styleId = 'b345a181-3709-4e12-b255-6fea3baf9f71'

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

const unusedFilters = {
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

const unusedStats: GetBreweryCountryStatsIf = {
  useStats: () => ({
    query: async () => ({ breweryCountry: [] }),
    stats: { breweryCountry: [] },
    isLoading: false,
  }),
  infiniteScroll: dontCall,
  minTime,
  maxTime,
  getUseDebounce,
}

test('queries brewery country stats', async () => {
  const query = vitest.fn()
  const setLoadedBreweryCountries = vitest.fn()
  render(
    <BreweryCountryAllAtOnce
      getBreweryCountryStatsIf={{
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
        infiniteScroll: dontCall,
        minTime,
        maxTime,
        getUseDebounce,
      }}
      breweryId={undefined}
      locationId={undefined}
      styleId={styleId}
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
          size: 10000,
          skip: 0,
        },
        sorting: {
          direction: 'asc',
          order: 'country_code',
        },
        styleId,
        timeStart: testTimes.min.utcTimestamp,
        timeEnd: testTimes.max.utcTimestamp,
      },
    ],
  ])
  await waitFor(() => {
    expect(setLoadedBreweryCountries.mock.calls).toEqual([
      [undefined],
      [[finland, estonia]],
    ])
  })
})

test('renders brewery country stats', () => {
  const { getByText } = render(
    <BreweryCountryAllAtOnce
      getBreweryCountryStatsIf={unusedStats}
      breweryId={undefined}
      locationId={undefined}
      styleId={styleId}
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

test('clears loaded brewery countries on filter change pending', () => {
  const setLoadedBreweryCountries = vitest.fn()
  render(
    <BreweryCountryAllAtOnce
      getBreweryCountryStatsIf={unusedStats}
      breweryId={undefined}
      locationId={undefined}
      styleId={styleId}
      loadedBreweryCountries={[finland, estonia]}
      setLoadedBreweryCountries={setLoadedBreweryCountries}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: dontCall,
      }}
      isFilterChangePending={true}
      statsParams={statsParams}
    />,
  )
  expect(setLoadedBreweryCountries.mock.calls).toEqual([
    [undefined],
    [undefined],
  ])
})

test('renders loading', () => {
  const { getAllByRole } = render(
    <BreweryCountryAllAtOnce
      getBreweryCountryStatsIf={{
        useStats: () => ({
          query: async (): Promise<BreweryCountryStats> => ({
            breweryCountry: [],
          }),
          stats: undefined,
          isLoading: true,
        }),
        infiniteScroll: dontCall,
        minTime,
        maxTime,
        getUseDebounce,
      }}
      breweryId={undefined}
      locationId={undefined}
      styleId={styleId}
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

test('sets minimum review count filter', () => {
  const setMinimumReviewAverage = vitest.fn()
  const { getByDisplayValue } = render(
    <BreweryCountryAllAtOnce
      getBreweryCountryStatsIf={unusedStats}
      breweryId={undefined}
      locationId={undefined}
      styleId={styleId}
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

test('opens filter', async () => {
  const user = setupUser()
  const setIsFiltersOpen = vitest.fn()
  const { getByRole } = render(
    <BreweryCountryAllAtOnce
      getBreweryCountryStatsIf={unusedStats}
      breweryId={undefined}
      locationId={undefined}
      styleId={styleId}
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
