import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import LocationAllAtOnce from './LocationAllAtOnce'
import LinkWrapper from '../LinkWrapper'
import { openFilters } from './filters-test-util'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const breweryId = '1d92a74e-ea4c-4dc6-9303-88cb66a1be9d'
const locationId = '575734e1-8bfa-4cd6-b550-0bb9c3f2f095'
const styleId = '77e4a2e4-b377-45e9-ac21-9a53562eb305'

const plevna = {
  locationId: '256997df-206d-4d6b-aed8-2e5448e97a09',
  locationName: 'Plevna',
  reviewAverage: '9.06',
  reviewCount: '63'
}

const oluthuone = {
  locationId: '62853cb5-a23a-4aaa-9c03-6c2c17bb2013',
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
  infiniteScroll: dontCall
}

test('queries location stats', async () => {
  const query = vitest.fn()
  const setLoadedLocations = vitest.fn()
  render(
    <LinkWrapper>
      <LocationAllAtOnce
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
          infiniteScroll: dontCall
        }}
        breweryId={breweryId}
        locationId={locationId}
        styleId={styleId}
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
  expect(query.mock.calls).toEqual([[{
    breweryId,
    locationId,
    maxReviewAverage: unusedFilters.maxReviewAverage.value,
    maxReviewCount: unusedFilters.maxReviewCount.value,
    minReviewAverage: unusedFilters.minReviewAverage.value,
    minReviewCount: unusedFilters.minReviewCount.value,
    pagination: {
      size: 10000,
      skip: 0
    },
    sorting: {
      direction: 'asc',
      order: 'location_name'
    },
    styleId
  }]])
  await waitFor(() =>
    { expect(setLoadedLocations.mock.calls).toEqual([
      [undefined],
      [undefined],
      [[plevna, oluthuone]]
    ]); }
  )
})

test('renders location stats', () => {
  const { getByText } = render(
    <LinkWrapper>
      <LocationAllAtOnce
        getLocationStatsIf={unusedStats}
        breweryId={undefined}
        locationId={undefined}
        styleId={styleId}
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
      <LocationAllAtOnce
        getLocationStatsIf={unusedStats}
        breweryId={undefined}
        locationId={undefined}
        styleId={styleId}
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

test('opens filter', async () => {
  const user = userEvent.setup()
  const setIsFiltersOpen = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <LocationAllAtOnce
        getLocationStatsIf={unusedStats}
        breweryId={undefined}
        locationId={undefined}
        styleId={styleId}
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
