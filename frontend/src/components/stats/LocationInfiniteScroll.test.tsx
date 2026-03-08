import { fireEvent, render, waitFor } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import userEvent from '@testing-library/user-event'
import { testTimes } from '../../../test-util/filter-time'
import LocationInfiniteScroll from './LocationInfiniteScroll'
import LinkWrapper from '../LinkWrapper'
import { openFilters } from './filters-test-util'
import type {
  GetLocationStatsIf,
  LocationStats,
  StatsFilters,
  YearMonth
} from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const plevna = {
  locationId: 'd25daf1d-6586-4d9d-81fb-ae27f07b5fba',
  locationName: 'Plevna',
  reviewAverage: '9.06',
  reviewCount: '63'
}

const oluthuone = {
  locationId: 'ff17d099-a959-45f8-bdbb-5fc3b325930e',
  locationName: 'Oluthuone Panimomestari',
  reviewAverage: '9.71',
  reviewCount: '24'
}

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const unusedFilters: StatsFilters = {
  minReviewCount: {
    value: 1,
    setValue: dontCall
  },
  maxReviewCount: {
    value: Infinity,
    setValue: dontCall
  },
  minReviewAverage: {
    value: 4.0,
    setValue: dontCall
  },
  maxReviewAverage: {
    value: 10.0,
    setValue: dontCall
  },
  timeStart: {
    min: minTime,
    max: maxTime,
    value: minTime,
    setValue: dontCall
  },
  timeEnd: {
    min: minTime,
    max: maxTime,
    value: maxTime,
    setValue: dontCall
  }
}

const getUseDebounce = function<T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const unusedStats: GetLocationStatsIf = {
  useStats: () => ({
    query: async () => ({ location: []}),
      stats: { location: [] },
    isLoading: false
  }),
  infiniteScroll: () => () => undefined,
  minTime,
  maxTime,
  getUseDebounce
}

test('queries location stats', async () => {
  const query = vitest.fn()
  const setLoadedLocations = vitest.fn()
  let loadCallback: () => void = () => undefined
  const getLocationStatsIf: GetLocationStatsIf = {
    useStats: () => ({
      query: async (params): Promise<LocationStats> => {
        query(params)
        return {
          location: [
            { ...plevna },
            { ...oluthuone }
          ]
        }
      },
      stats: {
        location: []
      },
      isLoading: false
    }),
    infiniteScroll: (cb) => {
      loadCallback = cb
      return () => undefined
    },
    minTime,
    maxTime,
    getUseDebounce
  }
  render(
    <LinkWrapper>
      <LocationInfiniteScroll
        getLocationStatsIf={getLocationStatsIf}
        loadedLocations={undefined}
        setLoadedLocations={setLoadedLocations}
        sortingDirection={'asc'}
        sortingOrder={'location_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={() => undefined}
        isFilterChangePending={false}
      />
    </LinkWrapper>
  )
  expect(query.mock.calls).toEqual([])
  loadCallback()
  expect(query.mock.calls).toEqual([[{
    locationId: undefined,
    maxReviewAverage: unusedFilters.maxReviewAverage.value,
    maxReviewCount: unusedFilters.maxReviewCount.value,
    minReviewAverage: unusedFilters.minReviewAverage.value,
    minReviewCount: unusedFilters.minReviewCount.value,
    pagination: {
      size: 30,
      skip: 0
    },
    sorting: {
      direction: 'asc',
      order: 'location_name'
    },
    styleId: undefined,
    timeStart: testTimes.min.utcTimestamp,
    timeEnd: testTimes.max.utcTimestamp
  }]])
  await waitFor(() =>
    { expect(setLoadedLocations.mock.calls).toEqual([[[plevna, oluthuone]]]); }
  )
})

test('renders location stats', () => {
  const { getByText } = render(
    <LinkWrapper>
      <LocationInfiniteScroll
        getLocationStatsIf={unusedStats}
        loadedLocations={[plevna, oluthuone]}
        setLoadedLocations={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'location_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={dontCall}
        isFilterChangePending={false}
      />
    </LinkWrapper>
  )
  getByText(plevna.locationName)
  getByText(plevna.reviewAverage)
  getByText(plevna.reviewCount)
  getByText(oluthuone.locationName)
  getByText(oluthuone.reviewAverage)
  getByText(oluthuone.reviewCount)
})

test('sets minimum review count filter', () => {
  const setMinimumReviewAverage = vitest.fn()
  const { getByDisplayValue } = render(
    <LinkWrapper>
      <LocationInfiniteScroll
        getLocationStatsIf={unusedStats}
        loadedLocations={[plevna, oluthuone]}
        setLoadedLocations={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'location_name'}
        setSortingOrder={() => undefined}
        filters={{
          ...unusedFilters,
          minReviewAverage: {
            value: 4.0,
            setValue: setMinimumReviewAverage
          }
        }}
        isFiltersOpen={true}
        setIsFiltersOpen={dontCall}
        isFilterChangePending={false}
      />
    </LinkWrapper>
  )
  const slider = getByDisplayValue('4')
  fireEvent.change(slider, {target: {value: '4.5'}})
  expect(setMinimumReviewAverage.mock.calls).toEqual([[4.5]])
})

test('opens filters', async () => {
  const user = userEvent.setup()
  const setIsFiltersOpen = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <LocationInfiniteScroll
        getLocationStatsIf={unusedStats}
        loadedLocations={[plevna, oluthuone]}
        setLoadedLocations={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'location_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={setIsFiltersOpen}
        isFilterChangePending={false}
      />
    </LinkWrapper>
  )
  await openFilters(getByRole, user)
  expect(setIsFiltersOpen.mock.calls).toEqual([[true]])
})
