import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render, waitFor } from '../../../render'
import { fireEvent } from '../../../fire-event'
import { setupUser } from '../../../user-event'
import { testTimes } from '../../filter-time'
import LocationInfiniteScroll from '../../../../src/components/internal/stats/LocationInfiniteScroll'
import { openFilters } from '../../open-filters'
import type {
  GetLocationStatsIf,
  LocationStats,
  LocationStatsSortingOrder,
  OneLocationStats,
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
import type { LocationStatsQueryParams } from '../../../../src/components/types/stats/types'

const plevna: OneLocationStats = {
  locationId: 'd25daf1d-6586-4d9d-81fb-ae27f07b5fba',
  locationName: 'Plevna',
  reviewAverage: '9.06',
  reviewCount: '63',
  reviewMedian: '9.00',
  reviewMode: '9',
  reviewStandardDeviation: '0.35',
}

const oluthuone: OneLocationStats = {
  locationId: 'ff17d099-a959-45f8-bdbb-5fc3b325930e',
  locationName: 'Oluthuone Panimomestari',
  reviewAverage: '9.71',
  reviewCount: '24',
  reviewMedian: '9.50',
  reviewMode: '10',
  reviewStandardDeviation: '0.84',
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

const statsParams: FormattedStatsParams<LocationStatsSortingOrder> = {
  sortingOrder: 'location_name',
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

const unusedStats: GetLocationStatsIf = {
  useStats: () => ({
    query: async () => ({ location: [] }),
    stats: { location: [] },
    isLoading: false,
  }),
  infiniteScroll: () => () => undefined,
  minTime,
  maxTime,
  getUseDebounce,
}

test('queries location stats', async () => {
  const query = mockFunction<[params: LocationStatsQueryParams]>()
  const setLoadedLocations =
    mockFunction<
      [
        update: (
          current: OneLocationStats[] | undefined,
        ) => OneLocationStats[] | undefined,
      ]
    >()
  let loadCallback: () => void = () => undefined
  const getLocationStatsIf: GetLocationStatsIf = {
    useStats: () => ({
      query: async (params): Promise<LocationStats> => {
        query(params)
        return {
          location: [{ ...plevna }, { ...oluthuone }],
        }
      },
      stats: {
        location: [],
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
    <LocationInfiniteScroll
      linkComponent={testLink}
      getLocationStatsIf={getLocationStatsIf}
      loadedLocations={undefined}
      setLoadedLocations={setLoadedLocations}
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
          order: 'location_name',
        },
        styleId: undefined,
        timeStart: testTimes.min.utcTimestamp,
        timeEnd: testTimes.max.utcTimestamp,
      },
    ],
  ])
  await waitFor(() => {
    assertDeepEqual(updatedItems(setLoadedLocations.mock.calls, undefined), [
      [plevna, oluthuone],
    ])
  })
})

test('renders location stats', () => {
  const { getByText } = render(
    <LocationInfiniteScroll
      linkComponent={testLink}
      getLocationStatsIf={unusedStats}
      loadedLocations={[plevna, oluthuone]}
      setLoadedLocations={() => undefined}
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
  getByText(plevna.locationName)
  getByText(plevna.reviewAverage)
  getByText(plevna.reviewCount)
  getByText(plevna.reviewMedian)
  getByText(plevna.reviewMode)
  getByText(plevna.reviewStandardDeviation)
  getByText(oluthuone.locationName)
  getByText(oluthuone.reviewAverage)
  getByText(oluthuone.reviewCount)
  getByText(oluthuone.reviewMedian)
  getByText(oluthuone.reviewMode)
  getByText(oluthuone.reviewStandardDeviation)
})

test('renders loading', () => {
  const { getAllByRole } = render(
    <LocationInfiniteScroll
      linkComponent={testLink}
      getLocationStatsIf={{
        ...unusedStats,
        useStats: () => ({
          query: dontCall,
          stats: undefined,
          isLoading: true,
        }),
      }}
      loadedLocations={undefined}
      setLoadedLocations={() => undefined}
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
  assertEqual(cells.length, 9)
})

test('does not try to load more when there is no more', () => {
  let loadCallback: () => void = () => undefined
  const query = mockFunction<
    [params: LocationStatsQueryParams],
    Promise<LocationStats>
  >(async () => ({ location: [] }))
  render(
    <LocationInfiniteScroll
      linkComponent={testLink}
      getLocationStatsIf={{
        ...unusedStats,
        useStats: () => ({
          query: query,
          stats: {
            location: [],
          },
          isLoading: false,
        }),
        infiniteScroll: (cb) => {
          loadCallback = cb
          return (): void => undefined
        },
      }}
      loadedLocations={[]}
      setLoadedLocations={() => undefined}
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
    [params: LocationStatsQueryParams],
    Promise<LocationStats>
  >(async () => ({ location: [] }))
  render(
    <LocationInfiniteScroll
      linkComponent={testLink}
      getLocationStatsIf={{
        ...unusedStats,
        useStats: () => ({
          query: query,
          stats: {
            location: [],
          },
          isLoading: true,
        }),
        infiniteScroll: (cb) => {
          loadCallback = cb
          return (): void => undefined
        },
      }}
      loadedLocations={undefined}
      setLoadedLocations={() => undefined}
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
    <LocationInfiniteScroll
      linkComponent={testLink}
      getLocationStatsIf={unusedStats}
      loadedLocations={[plevna, oluthuone]}
      setLoadedLocations={() => undefined}
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
    <LocationInfiniteScroll
      linkComponent={testLink}
      getLocationStatsIf={unusedStats}
      loadedLocations={[plevna, oluthuone]}
      setLoadedLocations={() => undefined}
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
