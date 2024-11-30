import { act, fireEvent, render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import BreweryAllAtOnce from './BreweryAllAtOnce'
import LinkWrapper from '../LinkWrapper'

const dontCall = (): any => {
  throw new Error('must not be called')
}

function openFilters(
  getByRole: (type: string, props: Record<string, string>) => HTMLElement
): void {
  const toggleButton = getByRole('button', { name: 'Filters ▼' })
  act(() => { toggleButton.click(); })
}

const styleId = 'b345a181-3709-4e12-b255-6fea3baf9f71'

const koskipanimo = {
  breweryId: '9bf16009-53f2-42e9-86f2-7dc80211aa63',
  breweryName: 'Koskipanimo',
  reviewAverage: '9.06',
  reviewCount: '63'
}

const lehe = {
  breweryId: '1db4ef0e-f9a1-441f-b803-6b9b80d971ce',
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
  infiniteScroll: dontCall
}

test('queries brewery stats', async () => {
  const query = vitest.fn()
  const setLoadedBreweries = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <BreweryAllAtOnce
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
          infiniteScroll: dontCall
        }}
        breweryId={undefined}
        styleId={styleId}
        loadedBreweries={undefined}
        setLoadedBreweries={setLoadedBreweries}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
      />
    </LinkWrapper>
  )
  expect(query.mock.calls).toEqual([[{
    breweryId: undefined,
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
      order: 'brewery_name'
    },
    styleId
  }]])
  // Need to do something to get breweries set.
  await act(async() => { openFilters(getByRole); })
  expect(setLoadedBreweries.mock.calls).toEqual([
    [undefined],
    [undefined],
    [[koskipanimo, lehe]]
  ])
})

test('renders brewery stats', () => {
  const { getByText } = render(
    <LinkWrapper>
      <BreweryAllAtOnce
        getBreweryStatsIf={unusedStats}
        breweryId={undefined}
        styleId={styleId}
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
  const setMinimumReviewAverage = vitest.fn()
  const { getByDisplayValue, getByRole } = render(
    <LinkWrapper>
      <BreweryAllAtOnce
        getBreweryStatsIf={unusedStats}
        breweryId={undefined}
        styleId={styleId}
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
  await act(async() => { openFilters(getByRole); })
  const slider = getByDisplayValue('4')
  fireEvent.change(slider, {target: {value: '4.5'}})
  expect(setMinimumReviewAverage.mock.calls).toEqual([[4.5]])
})
