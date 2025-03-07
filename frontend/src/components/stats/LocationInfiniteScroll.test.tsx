import { fireEvent, render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import userEvent from '@testing-library/user-event'
import LocationInfiniteScroll from './LocationInfiniteScroll'
import LinkWrapper from '../LinkWrapper'
import { openFilters } from './filters-test-util'

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

const unusedFilters = {
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
  }
}

const unusedStats = {
  useStats: () => ({
    query: async () => ({ location: []}),
      stats: { location: [] },
    isLoading: false
  }),
  infiniteScroll: () => () => undefined
}

test('queries location stats', async () => {
  const user = userEvent.setup()
  const query = vitest.fn()
  const setLoadedLocations = vitest.fn()
  let loadCallback: () => void = () => undefined
  const { getByRole } = render(
    <LinkWrapper>
      <LocationInfiniteScroll
        getLocationStatsIf={{
          useStats: () => ({
            query: async (params) => {
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
          }
        }}
        loadedLocations={undefined}
        setLoadedLocations={setLoadedLocations}
        sortingDirection={'asc'}
        sortingOrder={'location_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={() => undefined}
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
    styleId: undefined
  }]])
  // Need to do something to get locations set.
  await openFilters(getByRole, user)
  expect(setLoadedLocations.mock.calls).toEqual([[[plevna, oluthuone]]])
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
      />
    </LinkWrapper>
  )
  await openFilters(getByRole, user)
  expect(setIsFiltersOpen.mock.calls).toEqual([[true]])
})
