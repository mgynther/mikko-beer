import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render, waitFor } from '../../../render'
import { fireEvent } from '../../../fire-event'
import { setupUser } from '../../../user-event'
import { testTimes } from '../../filter-time'
import BreweryInfiniteScroll from '../../../../src/components/internal/stats/BreweryInfiniteScroll'
import { openFilters } from '../../open-filters'
import type {
  BreweryStats,
  BreweryStatsSortingOrder,
  GetBreweryStatsIf,
  OneBreweryStats,
} from '../../../../src/components/types/stats/types'
import type {
  UseDebounce,
  YearMonth,
} from '../../../../src/components/types/types'
import type { StatsFilters } from '../../../../src/components/internal/stats/filter-types'
import { dontCall } from '../../../dont-call'
import { updatedItems } from './load-more'
import type { FormattedStatsParams } from '../../../../src/components/internal/stats/search-params'
import { testLink } from '../../link'
import type { BreweryStatsQueryParams } from '../../../../src/components/types/stats/types'

const koskipanimo: OneBreweryStats = {
  breweryId: '59c825c9-b346-420a-9e67-f0ae1af1d962',
  breweryName: 'Koskipanimo',
  breweryCountry: undefined,
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
  breweryCountry: undefined,
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

const statsParams: FormattedStatsParams<BreweryStatsSortingOrder> = {
  sortingOrder: 'brewery_name',
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
  const query = mockFunction<[params: BreweryStatsQueryParams]>()
  const setLoadedBreweries =
    mockFunction<
      [
        update: (
          current: OneBreweryStats[] | undefined,
        ) => OneBreweryStats[] | undefined,
      ]
    >()
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
    <BreweryInfiniteScroll
      linkComponent={testLink}
      getBreweryStatsIf={getBreweryStatsIf}
      loadedBreweries={undefined}
      setLoadedBreweries={setLoadedBreweries}
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
  assertDeepEqual(query.mock.calls, [])
  loadCallback()
  assertDeepEqual(query.mock.calls, [
    [
      {
        breweryId: undefined,
        locationId: undefined,
        maxReviewAverage: statsParams.maxReviewAverage,
        maxReviewCount: statsParams.maxReviewCount,
        minReviewAverage: statsParams.minReviewAverage,
        minReviewCount: statsParams.minReviewCount,
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
    assertDeepEqual(updatedItems(setLoadedBreweries.mock.calls, undefined), [
      [koskipanimo, lehe],
    ])
  })
})

test('renders brewery stats', () => {
  const { getByText } = render(
    <BreweryInfiniteScroll
      linkComponent={testLink}
      getBreweryStatsIf={unusedStats}
      loadedBreweries={[koskipanimo, lehe]}
      setLoadedBreweries={() => undefined}
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
    <BreweryInfiniteScroll
      linkComponent={testLink}
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
  assertEqual(cells.length, 6 * 3)
})

test('does not try to load more when there is no more', () => {
  let loadCallback: () => void = () => undefined
  const query = mockFunction<
    [params: BreweryStatsQueryParams],
    Promise<BreweryStats>
  >(async () => ({ brewery: [] }))
  render(
    <BreweryInfiniteScroll
      linkComponent={testLink}
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
  assertDeepEqual(query.mock.calls, [])
})

test('does not try to load more when loading', () => {
  let loadCallback: () => void = () => undefined
  const query = mockFunction<
    [params: BreweryStatsQueryParams],
    Promise<BreweryStats>
  >(async () => ({ brewery: [] }))
  render(
    <BreweryInfiniteScroll
      linkComponent={testLink}
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
  assertDeepEqual(query.mock.calls, [])
})

test('sets minimum review count filter', () => {
  const setMinimumReviewAverage = mockFunction<[value: number]>()
  const { getByDisplayValue } = render(
    <BreweryInfiniteScroll
      linkComponent={testLink}
      getBreweryStatsIf={unusedStats}
      loadedBreweries={[koskipanimo, lehe]}
      setLoadedBreweries={() => undefined}
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
  assertDeepEqual(setMinimumReviewAverage.mock.calls, [[4.5]])
})

test('opens filters', async () => {
  const user = setupUser()
  const setIsFiltersOpen = mockFunction<[isOpen: boolean]>()
  const { getByRole } = render(
    <BreweryInfiniteScroll
      linkComponent={testLink}
      getBreweryStatsIf={unusedStats}
      loadedBreweries={[koskipanimo, lehe]}
      setLoadedBreweries={() => undefined}
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
  assertDeepEqual(setIsFiltersOpen.mock.calls, [[true]])
})
