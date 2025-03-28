import { fireEvent, render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import userEvent from '@testing-library/user-event'
import BreweryInfiniteScroll from './BreweryInfiniteScroll'
import LinkWrapper from '../LinkWrapper'
import { openFilters } from './filters-test-util'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const koskipanimo = {
  breweryId: '59c825c9-b346-420a-9e67-f0ae1af1d962',
  breweryName: 'Koskipanimo',
  reviewAverage: '9.06',
  reviewCount: '63'
}

const lehe = {
  breweryId: '2816d69f-ddf1-449f-be32-3a2a880ac45b',
  breweryName: 'Lehe pruulikoda',
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
    query: async () => ({ brewery: []}),
      stats: { brewery: [] },
    isLoading: false
  }),
  infiniteScroll: () => () => undefined
}

test('queries brewery stats', async () => {
  const user = userEvent.setup()
  const query = vitest.fn()
  const setLoadedBreweries = vitest.fn()
  let loadCallback: () => void = () => undefined
  const { getByRole } = render(
    <LinkWrapper>
      <BreweryInfiniteScroll
        getBreweryStatsIf={{
          useStats: () => ({
            query: async (params) => {
              query(params)
              return {
                brewery: [
                  { ...koskipanimo },
                  { ...lehe }
                ]
              }
            },
            stats: {
              brewery: []
            },
            isLoading: false
          }),
          infiniteScroll: (cb) => {
            loadCallback = cb
            return () => undefined
          }
        }}
        loadedBreweries={undefined}
        setLoadedBreweries={setLoadedBreweries}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
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
    breweryId: undefined,
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
      order: 'brewery_name'
    },
    styleId: undefined
  }]])
  // Need to do something to get breweries set.
  await openFilters(getByRole, user)
  expect(setLoadedBreweries.mock.calls).toEqual([[[koskipanimo, lehe]]])
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
      />
    </LinkWrapper>
  )
  getByText(koskipanimo.breweryName)
  getByText(koskipanimo.reviewAverage)
  getByText(koskipanimo.reviewCount)
  getByText(lehe.breweryName)
  getByText(lehe.reviewAverage)
  getByText(lehe.reviewCount)
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
      />
    </LinkWrapper>
  )
  await openFilters(getByRole, user)
  expect(setIsFiltersOpen.mock.calls).toEqual([[true]])
})
