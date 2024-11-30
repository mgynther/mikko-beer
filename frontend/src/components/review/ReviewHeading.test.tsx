import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import ReviewHeading from './ReviewHeading'
import type { ReviewSorting, ReviewSortingOrder } from '../../core/review/types'

interface SortingTest {
  name: string
  originalSorting: ReviewSorting
  supportedSorting: ReviewSortingOrder[]
  sortButtonText: string
  expectedSorting: ReviewSorting
}

const sortingTests: SortingTest[] = [
  {
    name: 'sets breweries sorting',
    originalSorting: {
      order: 'beer_name',
      direction: 'asc'
    },
    supportedSorting: ['brewery_name'],
    sortButtonText: 'Breweries',
    expectedSorting: {
      order: 'brewery_name',
      direction: 'desc'
    }
  },
  {
    name: 'reverses breweries sorting asc',
    originalSorting: {
      order: 'brewery_name',
      direction: 'asc'
    },
    supportedSorting: ['brewery_name'],
    sortButtonText: 'Breweries ▲',
    expectedSorting: {
      order: 'brewery_name',
      direction: 'desc'
    }
  },
  {
    name: 'reverses breweries sorting desc',
    originalSorting: {
      order: 'brewery_name',
      direction: 'desc'
    },
    supportedSorting: ['brewery_name'],
    sortButtonText: 'Breweries ▼',
    expectedSorting: {
      order: 'brewery_name',
      direction: 'asc'
    }
  },
  {
    name: 'sets beer name sorting',
    originalSorting: {
      order: 'brewery_name',
      direction: 'asc'
    },
    supportedSorting: ['beer_name'],
    sortButtonText: 'Name',
    expectedSorting: {
      order: 'beer_name',
      direction: 'desc'
    }
  },
  {
    name: 'reverses beer sorting asc',
    originalSorting: {
      order: 'beer_name',
      direction: 'asc'
    },
    supportedSorting: ['beer_name'],
    sortButtonText: 'Name ▲',
    expectedSorting: {
      order: 'beer_name',
      direction: 'desc'
    }
  },
  {
    name: 'reverses beer sorting desc',
    originalSorting: {
      order: 'beer_name',
      direction: 'desc'
    },
    supportedSorting: ['beer_name'],
    sortButtonText: 'Name ▼',
    expectedSorting: {
      order: 'beer_name',
      direction: 'asc'
    }
  },
  {
    name: 'sets rating sorting',
    originalSorting: {
      order: 'brewery_name',
      direction: 'asc'
    },
    supportedSorting: ['rating'],
    sortButtonText: 'Rating',
    expectedSorting: {
      order: 'rating',
      direction: 'desc'
    }
  },
  {
    name: 'reverses rating sorting asc',
    originalSorting: {
      order: 'rating',
      direction: 'asc'
    },
    supportedSorting: ['rating'],
    sortButtonText: 'Rating ▲',
    expectedSorting: {
      order: 'rating',
      direction: 'desc'
    }
  },
  {
    name: 'reverses rating sorting desc',
    originalSorting: {
      order: 'rating',
      direction: 'desc'
    },
    supportedSorting: ['rating'],
    sortButtonText: 'Rating ▼',
    expectedSorting: {
      order: 'rating',
      direction: 'asc'
    }
  },
  {
    name: 'sets time sorting',
    originalSorting: {
      order: 'brewery_name',
      direction: 'asc'
    },
    supportedSorting: ['time'],
    sortButtonText: 'Time',
    expectedSorting: {
      order: 'time',
      direction: 'desc'
    }
  },
  {
    name: 'reverses time sorting asc',
    originalSorting: {
      order: 'time',
      direction: 'asc'
    },
    supportedSorting: ['time'],
    sortButtonText: 'Time ▲',
    expectedSorting: {
      order: 'time',
      direction: 'desc'
    }
  },
  {
    name: 'reverses time sorting desc',
    originalSorting: {
      order: 'time',
      direction: 'desc'
    },
    supportedSorting: ['time'],
    sortButtonText: 'Time ▼',
    expectedSorting: {
      order: 'time',
      direction: 'asc'
    }
  },
]

sortingTests.forEach(testCase => {
  test(testCase.name, async () => {
    const user = userEvent.setup()
    const setSorting = vitest.fn()
    const { getByRole } = render(
      <ReviewHeading
        sorting={testCase.originalSorting}
        setSorting={setSorting}
        supportedSorting={testCase.supportedSorting}
      />
    )
    const sortButton = getByRole('button', { name: testCase.sortButtonText })
    await user.click(sortButton)
    expect(setSorting.mock.calls).toEqual([[testCase.expectedSorting]])
  })
})

test('no sorting buttons when not supported', () => {
  const setSorting = vitest.fn()
  const { queryAllByRole } = render(
    <ReviewHeading
    sorting={{
      order: 'beer_name',
      direction: 'asc'
    }}
    setSorting={setSorting}
    supportedSorting={[]}
    />
  )
  const sortButtons = queryAllByRole('button')
  expect(sortButtons).toEqual([])
})
