import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import BreweryAllAtOnce from './BreweryAllAtOnce'
import LinkWrapper from '../LinkWrapper'
import { openFilters } from './filters-test-util'
import type {
  BreweryStats,
  GetBreweryStatsIf,
  OneBreweryStats,
  YearMonth,
} from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const dontCall = (): any => {
  throw new Error('must not be called')
}

const styleId = 'b345a181-3709-4e12-b255-6fea3baf9f71'

const koskipanimo: OneBreweryStats = {
  breweryId: '9bf16009-53f2-42e9-86f2-7dc80211aa63',
  breweryName: 'Koskipanimo',
  reviewAverage: '9.06',
  reviewCount: '63',
  reviewMedian: '9.00',
  reviewMode: '9',
  reviewStandardDeviation: '0.35',
  reviewedBeerCount: '62',
}

const lehe: OneBreweryStats = {
  breweryId: '1db4ef0e-f9a1-441f-b803-6b9b80d971ce',
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

const unusedStats: GetBreweryStatsIf = {
  useStats: () => ({
    query: async () => ({ brewery: [] }),
    stats: { brewery: [] },
    isLoading: false,
  }),
  infiniteScroll: dontCall,
  minTime,
  maxTime,
  getUseDebounce,
}

test('queries brewery stats', async () => {
  const query = vitest.fn()
  const setLoadedBreweries = vitest.fn()
  render(
    <LinkWrapper>
      <BreweryAllAtOnce
        getBreweryStatsIf={{
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
          infiniteScroll: dontCall,
          minTime,
          maxTime,
          getUseDebounce,
        }}
        breweryId={undefined}
        locationId={undefined}
        styleId={styleId}
        loadedBreweries={undefined}
        setLoadedBreweries={setLoadedBreweries}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        isFilterChangePending={false}
        setIsFiltersOpen={() => undefined}
      />
    </LinkWrapper>,
  )
  expect(query.mock.calls).toEqual([
    [
      {
        breweryId: undefined,
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
          order: 'brewery_name',
        },
        styleId,
        timeStart: testTimes.min.utcTimestamp,
        timeEnd: testTimes.max.utcTimestamp,
      },
    ],
  ])
  await waitFor(() => {
    expect(setLoadedBreweries.mock.calls).toEqual([
      [undefined],
      [[koskipanimo, lehe]],
    ])
  })
})

test('renders brewery stats', () => {
  const { getByText } = render(
    <LinkWrapper>
      <BreweryAllAtOnce
        getBreweryStatsIf={unusedStats}
        breweryId={undefined}
        locationId={undefined}
        styleId={styleId}
        loadedBreweries={[koskipanimo, lehe]}
        setLoadedBreweries={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        isFilterChangePending={false}
        setIsFiltersOpen={dontCall}
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

test('clears loaded breweries on filter change pending', () => {
  const setLoadedBreweries = vitest.fn()
  render(
    <LinkWrapper>
      <BreweryAllAtOnce
        getBreweryStatsIf={unusedStats}
        breweryId={undefined}
        locationId={undefined}
        styleId={styleId}
        loadedBreweries={[koskipanimo, lehe]}
        setLoadedBreweries={setLoadedBreweries}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={dontCall}
        isFilterChangePending={true}
      />
    </LinkWrapper>,
  )
  expect(setLoadedBreweries.mock.calls).toEqual([[undefined], [undefined]])
})

test('renders loading', () => {
  const { getAllByRole } = render(
    <LinkWrapper>
      <BreweryAllAtOnce
        getBreweryStatsIf={{
          useStats: () => ({
            query: async (): Promise<BreweryStats> => ({ brewery: [] }),
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

test('sets minimum review count filter', () => {
  const setMinimumReviewAverage = vitest.fn()
  const { getByDisplayValue } = render(
    <LinkWrapper>
      <BreweryAllAtOnce
        getBreweryStatsIf={unusedStats}
        breweryId={undefined}
        locationId={undefined}
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
            setValue: setMinimumReviewAverage,
          },
        }}
        isFiltersOpen={true}
        isFilterChangePending={false}
        setIsFiltersOpen={dontCall}
      />
    </LinkWrapper>,
  )
  const slider = getByDisplayValue('4')
  fireEvent.change(slider, { target: { value: '4.5' } })
  expect(setMinimumReviewAverage.mock.calls).toEqual([[4.5]])
})

test('opens filter', async () => {
  const user = userEvent.setup()
  const setIsFiltersOpen = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <BreweryAllAtOnce
        getBreweryStatsIf={unusedStats}
        breweryId={undefined}
        locationId={undefined}
        styleId={styleId}
        loadedBreweries={[koskipanimo, lehe]}
        setLoadedBreweries={() => undefined}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        isFilterChangePending={false}
        setIsFiltersOpen={setIsFiltersOpen}
      />
    </LinkWrapper>,
  )
  await openFilters(getByRole, user)
  expect(setIsFiltersOpen.mock.calls).toEqual([[true]])
})
