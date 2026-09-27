import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import ReviewHeading from '../../../../src/components/internal/review/ReviewHeading'
import type {
  ReviewSorting,
  ReviewSortingOrder,
} from '../../../../src/components/types/review/types'
import { dontCall } from '../../../dont-call'
import { buildReviewFilters } from './builders'

const reviewFilters = buildReviewFilters()

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
    const user = setupUser()
    const setSorting = mockFunction<[sorting: ReviewSortingOrder]>()
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
    assertDeepEqual(setSorting.mock.calls, [[testCase.expectedSorting]])
  })
})

test('no sorting buttons when not supported', () => {
  const setSorting = mockFunction<[sorting: ReviewSortingOrder]>()
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
  assertDeepEqual(sortButtons, [filtersButton])
})
