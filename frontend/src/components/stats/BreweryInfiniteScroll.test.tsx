import { fireEvent, render, waitFor } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import userEvent from '@testing-library/user-event'
import { testTimes } from '../../../test-util/filter-time'
import BreweryInfiniteScroll from './BreweryInfiniteScroll'
import LinkWrapper from '../LinkWrapper'
import { openFilters } from './filters-test-util'
import type {
  BreweryStats,
  GetBreweryStatsIf,
  OneBreweryStats,
  StatsFilters,
  YearMonth,
} from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const koskipanimo: OneBreweryStats = {
  breweryId: '59c825c9-b346-420a-9e67-f0ae1af1d962',
  breweryName: 'Koskipanimo',
  reviewAverage: '9.06',
  reviewCount: '63',
  reviewMedian: '9.00',
  reviewMode: '9',
  reviewStandardDeviation: '0.35',
  reviewedBeerCount: '62',
}

const lehe: OneBreweryStats = {
  breweryId: '2816d69f-ddf1-449f-be32-3a2a880ac45b',
  breweryName: 'Lehe pruulikoda',
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

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const unusedStats: GetBreweryStatsIf = {
  useStats: () => ({
    query: async () => ({ brewery: [] }),
    stats: { brewery: [] },
    isLoading: false,
  }),
  infiniteScroll: () => () => undefined,
  minTime,
  maxTime,
  getUseDebounce,
}

test('queries brewery stats', async () => {
  const query = vitest.fn()
  const setLoadedBreweries = vitest.fn()
  let loadCallback: () => void = () => undefined
  const getBreweryStatsIf: GetBreweryStatsIf = {
    useStats: () => ({
      query: async (params): Promise<BreweryStats> => {
        query(params)
        return {
          brewery: [{ ...koskipanimo }, { ...lehe }],
        }
      },
      stats: {
        brewery: [],
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
    <LinkWrapper>
      <BreweryInfiniteScroll
        getBreweryStatsIf={getBreweryStatsIf}
        loadedBreweries={undefined}
        setLoadedBreweries={setLoadedBreweries}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={() => undefined}
        isFilterChangePending={false}
      />
    </LinkWrapper>,
  )
  expect(query.mock.calls).toEqual([])
  loadCallback()
  expect(query.mock.calls).toEqual([
    [
      {
        breweryId: undefined,
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
          order: 'brewery_name',
        },
        styleId: undefined,
        timeStart: testTimes.min.utcTimestamp,
        timeEnd: testTimes.max.utcTimestamp,
      },
    ],
  ])
  await waitFor(() => {
    expect(setLoadedBreweries.mock.calls).toEqual([[[koskipanimo, lehe]]])
  })
})

test('renders brewery stats', () => {
  const { getByText } = render(
    <LinkWrapper>
      <BreweryInfiniteScroll
        getBreweryStatsIf={unusedStats}
        loadedBreweries={[koskipanimo, lehe]}
        setLoadedBreweries={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={dontCall}
        isFilterChangePending={false}
      />
    </LinkWrapper>,
  )
  getByText(koskipanimo.breweryName)
  getByText(koskipanimo.reviewAverage)
  getByText(`${koskipanimo.reviewCount} (${koskipanimo.reviewedBeerCount})`)
  getByText(koskipanimo.reviewMedian)
  getByText(koskipanimo.reviewMode)
  getByText(koskipanimo.reviewStandardDeviation)
  getByText(lehe.breweryName)
  getByText(lehe.reviewAverage)
  getByText(lehe.reviewCount)
  getByText(lehe.reviewMedian)
  getByText(lehe.reviewMode)
  getByText(lehe.reviewStandardDeviation)
})

test('renders loading', () => {
  const { getAllByRole } = render(
    <LinkWrapper>
      <BreweryInfiniteScroll
        getBreweryStatsIf={{
          ...unusedStats,
          useStats: () => ({
            query: dontCall,
            stats: undefined,
            isLoading: true,
          }),
        }}
        loadedBreweries={undefined}
        setLoadedBreweries={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={dontCall}
        isFilterChangePending={false}
      />
    </LinkWrapper>,
  )
  const cells = getAllByRole('cell')
  expect(cells.length).toEqual(6 * 3)
})

test('does not try to load more when there is no more', () => {
  let loadCallback: () => void = () => undefined
  const query = vitest.fn()
  render(
    <LinkWrapper>
      <BreweryInfiniteScroll
        getBreweryStatsIf={{
          ...unusedStats,
          useStats: () => ({
            query: query,
            stats: {
              brewery: [],
            },
            isLoading: false,
          }),
          infiniteScroll: (cb) => {
            loadCallback = cb
            return (): void => undefined
          },
        }}
        loadedBreweries={[]}
        setLoadedBreweries={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={dontCall}
        isFilterChangePending={false}
      />
    </LinkWrapper>,
  )
  loadCallback()
  expect(query.mock.calls).toEqual([])
})

test('does not try to load more when loading', () => {
  let loadCallback: () => void = () => undefined
  const query = vitest.fn()
  render(
    <LinkWrapper>
      <BreweryInfiniteScroll
        getBreweryStatsIf={{
          ...unusedStats,
          useStats: () => ({
            query: query,
            stats: {
              brewery: [],
            },
            isLoading: true,
          }),
          infiniteScroll: (cb) => {
            loadCallback = cb
            return (): void => undefined
          },
        }}
        loadedBreweries={undefined}
        setLoadedBreweries={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={dontCall}
        isFilterChangePending={false}
      />
    </LinkWrapper>,
  )
  loadCallback()
  expect(query.mock.calls).toEqual([])
})

test('sets minimum review count filter', () => {
  const setMinimumReviewAverage = vitest.fn()
  const { getByDisplayValue } = render(
    <LinkWrapper>
      <BreweryInfiniteScroll
        getBreweryStatsIf={unusedStats}
        loadedBreweries={[koskipanimo, lehe]}
        setLoadedBreweries={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={{
          ...unusedFilters,
          minReviewAverage: {
            value: 4.0,
            setValue: setMinimumReviewAverage,
          },
        }}
        isFiltersOpen={true}
        setIsFiltersOpen={dontCall}
        isFilterChangePending={false}
      />
    </LinkWrapper>,
  )
  const slider = getByDisplayValue('4')
  fireEvent.change(slider, { target: { value: '4.5' } })
  expect(setMinimumReviewAverage.mock.calls).toEqual([[4.5]])
})

test('opens filters', async () => {
  const user = userEvent.setup()
  const setIsFiltersOpen = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <BreweryInfiniteScroll
        getBreweryStatsIf={unusedStats}
        loadedBreweries={[koskipanimo, lehe]}
        setLoadedBreweries={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={setIsFiltersOpen}
        isFilterChangePending={false}
      />
    </LinkWrapper>,
  )
  await openFilters(getByRole, user)
  expect(setIsFiltersOpen.mock.calls).toEqual([[true]])
})
