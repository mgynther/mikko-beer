import { fireEvent, render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import BreweryInfiniteScroll from './BreweryInfiniteScroll'
import LinkWrapper from '../LinkWrapper'

const dontCall = (): any => {
  throw new Error('must not be called')
}

async function openFilters(
  getByRole: (type: string, props: Record<string, string>) => HTMLElement,
  user: UserEvent
): Promise<void> {
  const toggleButton = getByRole('button', { name: 'Filters ▼' })
  await user.click(toggleButton)
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

test('sets minimum review count filter', async () => {
  const user = userEvent.setup()
  const setMinimumReviewAverage = vitest.fn()
  const { getByDisplayValue, getByRole } = render(
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
      />
    </LinkWrapper>
  )
  await openFilters(getByRole, user)
  const slider = getByDisplayValue('4')
  fireEvent.change(slider, {target: {value: '4.5'}})
  expect(setMinimumReviewAverage.mock.calls).toEqual([[4.5]])
})
