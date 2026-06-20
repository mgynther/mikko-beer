import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import ReviewHeading from './ReviewHeading'
import type { ReviewSorting, ReviewSortingOrder } from '../../core/review/types'
import type { ReviewFilters } from './filter-types'
import type { YearMonth } from '../../core/types'
import { testTimes } from '../../../test-util/filter-time'
import { dontCall } from '../../../test-util/dont-call'

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const reviewFilters: ReviewFilters = {
  minRating: {
    value: 4,
    setValue: dontCall,
  },
  maxRating: {
    value: 10,
    setValue: dontCall,
  },
  minTime: {
    min: minTime,
    max: maxTime,
    value: minTime,
    setValue: dontCall,
  },
  maxTime: {
    min: minTime,
    max: maxTime,
    value: maxTime,
    setValue: dontCall,
  },
}

interface SortingTest {
  name: string
  originalSorting: ReviewSorting
  supportedSorting: ReviewSortingOrder[]
  sortButtonText: string
  expectedSorting: ReviewSortingOrder
}

const sortingTests: SortingTest[] = [
  {
    name: 'sets breweries sorting',
    originalSorting: {
      order: 'beer_name',
      direction: 'asc',
    },
    supportedSorting: ['brewery_name'],
    sortButtonText: 'Breweries',
    expectedSorting: 'brewery_name',
  },
  {
    name: 'reverses breweries sorting asc',
    originalSorting: {
      order: 'brewery_name',
      direction: 'asc',
    },
    supportedSorting: ['brewery_name'],
    sortButtonText: 'Breweries ▲',
    expectedSorting: 'brewery_name',
  },
  {
    name: 'reverses breweries sorting desc',
    originalSorting: {
      order: 'brewery_name',
      direction: 'desc',
    },
    supportedSorting: ['brewery_name'],
    sortButtonText: 'Breweries ▼',
    expectedSorting: 'brewery_name',
  },
  {
    name: 'sets beer name sorting',
    originalSorting: {
      order: 'brewery_name',
      direction: 'asc',
    },
    supportedSorting: ['beer_name'],
    sortButtonText: 'Name',
    expectedSorting: 'beer_name',
  },
  {
    name: 'reverses beer sorting asc',
    originalSorting: {
      order: 'beer_name',
      direction: 'asc',
    },
    supportedSorting: ['beer_name'],
    sortButtonText: 'Name ▲',
    expectedSorting: 'beer_name',
  },
  {
    name: 'reverses beer sorting desc',
    originalSorting: {
      order: 'beer_name',
      direction: 'desc',
    },
    supportedSorting: ['beer_name'],
    sortButtonText: 'Name ▼',
    expectedSorting: 'beer_name',
  },
  {
    name: 'sets rating sorting',
    originalSorting: {
      order: 'brewery_name',
      direction: 'asc',
    },
    supportedSorting: ['rating'],
    sortButtonText: 'Rating',
    expectedSorting: 'rating',
  },
  {
    name: 'reverses rating sorting asc',
    originalSorting: {
      order: 'rating',
      direction: 'asc',
    },
    supportedSorting: ['rating'],
    sortButtonText: 'Rating ▲',
    expectedSorting: 'rating',
  },
  {
    name: 'reverses rating sorting desc',
    originalSorting: {
      order: 'rating',
      direction: 'desc',
    },
    supportedSorting: ['rating'],
    sortButtonText: 'Rating ▼',
    expectedSorting: 'rating',
  },
  {
    name: 'sets time sorting',
    originalSorting: {
      order: 'brewery_name',
      direction: 'asc',
    },
    supportedSorting: ['time'],
    sortButtonText: 'Time',
    expectedSorting: 'time',
  },
  {
    name: 'reverses time sorting asc',
    originalSorting: {
      order: 'time',
      direction: 'asc',
    },
    supportedSorting: ['time'],
    sortButtonText: 'Time ▲',
    expectedSorting: 'time',
  },
  {
    name: 'reverses time sorting desc',
    originalSorting: {
      order: 'time',
      direction: 'desc',
    },
    supportedSorting: ['time'],
    sortButtonText: 'Time ▼',
    expectedSorting: 'time',
  },
]

sortingTests.forEach((testCase) => {
  test(testCase.name, async () => {
    const user = userEvent.setup()
    const setSorting = vitest.fn()
    const { getByRole } = render(
      <ReviewHeading
        filterState={{
          isOpen: false,
          setIsOpen: dontCall,
          filters: reviewFilters,
        }}
        sorting={testCase.originalSorting}
        setSorting={setSorting}
        supportedSorting={testCase.supportedSorting}
      />,
    )
    const sortButton = getByRole('button', { name: testCase.sortButtonText })
    await user.click(sortButton)
    expect(setSorting.mock.calls).toEqual([[testCase.expectedSorting]])
  })
})

test('no sorting buttons when not supported', () => {
  const setSorting = vitest.fn()
  const { getByRole, queryAllByRole } = render(
    <ReviewHeading
      filterState={{
        isOpen: false,
        setIsOpen: dontCall,
        filters: reviewFilters,
      }}
      sorting={{
        order: 'beer_name',
        direction: 'asc',
      }}
      setSorting={setSorting}
      supportedSorting={[]}
    />,
  )
  const filtersButton = getByRole('button', { name: 'Filters ▼' })
  const sortButtons = queryAllByRole('button')
  expect(sortButtons).toEqual([filtersButton])
})
