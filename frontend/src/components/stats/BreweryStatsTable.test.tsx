import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import BreweryStatsTable from './BreweryStatsTable'
import LinkWrapper from '../LinkWrapper'
import type { BreweryStatsSortingOrder } from '../../core/stats/types'
import type { ListDirection } from '../../core/types'
import { openFilters } from './filters-test-util'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const koskipanimo = {
  breweryId: '9c761e23-0113-4eeb-b2d5-819f1f5345b5',
  breweryName: 'Koskipanimo',
  reviewAverage: '9.06',
  reviewCount: '63'
}

const lehe = {
  breweryId: 'a65d5e2a-7c00-48bb-80f2-14bc89940839',
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

test('renders brewery stats', () => {
  const { getByText } = render(
    <LinkWrapper>
      <BreweryStatsTable
        breweries={[
          koskipanimo,
          lehe
        ]}
        isLoading={false}
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

test('opens filters', async () => {
  const user = userEvent.setup()
  const setIsFiltersOpen = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <BreweryStatsTable
        breweries={[ koskipanimo, lehe ]}
        isLoading={false}
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

interface OrderTestData {
  buttonText: string,
  expectedOrder: BreweryStatsSortingOrder
  order: BreweryStatsSortingOrder,
  sortingDirection: ListDirection,
  testName: string
}

const orderTests: OrderTestData[] = [
  {
    buttonText: 'Brewery ▲',
    expectedOrder: 'brewery_name',
    order: 'brewery_name',
    sortingDirection: 'asc',
    testName: 'brewery name, flip order'
  },
  {
    buttonText: 'Brewery ▼',
    expectedOrder: 'brewery_name',
    order: 'brewery_name',
    sortingDirection: 'desc',
    testName: 'brewery name desc, flip order'
  },
  {
    buttonText: 'Reviews',
    expectedOrder: 'count',
    order: 'brewery_name',
    sortingDirection: 'asc',
    testName: 'reviews'
  },
  {
    buttonText: 'Average',
    expectedOrder: 'average',
    order: 'brewery_name',
    sortingDirection: 'asc',
    testName: 'average'
  }
]

orderTests.forEach(data => {
  test(`set order to ${data.testName}`, () => {
    const setSortingOrder = vitest.fn()
    const { getByRole } = render(
      <LinkWrapper>
        <BreweryStatsTable
          breweries={[
            koskipanimo,
            lehe
          ]}
          isLoading={false}
          sortingDirection={data.sortingDirection}
          sortingOrder={data.order}
          setSortingOrder={setSortingOrder}
          filters={unusedFilters}
          isFiltersOpen={false}
          setIsFiltersOpen={dontCall}
        />
      </LinkWrapper>
    )
    const orderButton = getByRole('button', { name: data.buttonText })
    orderButton.click()
    expect(setSortingOrder.mock.calls).toEqual([[data.expectedOrder]])
  })
})

test('sets minimum review count filter', () => {
  const setMinimumReviewCount = vitest.fn()
  const { getByDisplayValue } = render(
    <LinkWrapper>
      <BreweryStatsTable
        breweries={[
          koskipanimo,
          lehe
        ]}
        isLoading={false}
        sortingDirection={'asc'}
        sortingOrder={'brewery_name'}
        setSortingOrder={() => undefined}
        filters={{
          minReviewCount: {
            value: 3,
            setValue: setMinimumReviewCount
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
        }}
        isFiltersOpen={true}
        setIsFiltersOpen={dontCall}
      />
    </LinkWrapper>
  )
  const slider = getByDisplayValue('2')
  fireEvent.change(slider, {target: {value: '3'}})
  expect(setMinimumReviewCount.mock.calls).toEqual([[5]])
})
