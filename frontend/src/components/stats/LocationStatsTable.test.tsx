import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import LocationStatsTable from './LocationStatsTable'
import LinkWrapper from '../LinkWrapper'
import type { LocationStatsSortingOrder } from '../../core/stats/types'
import type { ListDirection } from '../../core/types'
import { openFilters } from './filters-test-util'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const plevna = {
  locationId: '2aad4052-1f8a-4088-87d8-c079f40d74b9',
  locationName: 'Plevna',
  reviewAverage: '9.06',
  reviewCount: '63'
}

const oluthuone = {
  locationId: '0a1c8153-5dfb-42d8-9410-827d7c53bee3',
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

test('renders location stats', async () => {
  const user = userEvent.setup()
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <LocationStatsTable
        locations={[
          plevna,
          oluthuone
        ]}
        isLoading={false}
        sortingDirection={'asc'}
        sortingOrder={'location_name'}
        setSortingOrder={() => undefined}
        filters={unusedFilters}
        isFiltersOpen={false}
        setIsFiltersOpen={dontCall}
      />
    </LinkWrapper>
  )
  getByText(plevna.reviewAverage)
  getByText(plevna.reviewCount)
  getByText(oluthuone.locationName)
  getByText(oluthuone.reviewAverage)
  getByText(oluthuone.reviewCount)
  const link = getByRole('link', { name: plevna.locationName })
  await user.click(link)
  const path = `/locations/${plevna.locationId}`
  expect(window.location.pathname).toEqual(path)
})

test('opens filters', async () => {
  const user = userEvent.setup()
  const setIsFiltersOpen = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <LocationStatsTable
        locations={[ plevna, oluthuone ]}
        isLoading={false}
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

interface OrderTestData {
  buttonText: string,
  expectedOrder: LocationStatsSortingOrder
  order: LocationStatsSortingOrder,
  sortingDirection: ListDirection,
  testName: string
}

const orderTests: OrderTestData[] = [
  {
    buttonText: 'Location ▲',
    expectedOrder: 'location_name',
    order: 'location_name',
    sortingDirection: 'asc',
    testName: 'location name, flip order'
  },
  {
    buttonText: 'Location ▼',
    expectedOrder: 'location_name',
    order: 'location_name',
    sortingDirection: 'desc',
    testName: 'location name desc, flip order'
  },
  {
    buttonText: 'Reviews',
    expectedOrder: 'count',
    order: 'location_name',
    sortingDirection: 'asc',
    testName: 'reviews'
  },
  {
    buttonText: 'Average',
    expectedOrder: 'average',
    order: 'location_name',
    sortingDirection: 'asc',
    testName: 'average'
  }
]

orderTests.forEach(data => {
  test(`set order to ${data.testName}`, () => {
    const setSortingOrder = vitest.fn()
    const { getByRole } = render(
      <LinkWrapper>
        <LocationStatsTable
          locations={[
            plevna,
            oluthuone
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
      <LocationStatsTable
        locations={[
          plevna,
          oluthuone
        ]}
        isLoading={false}
        sortingDirection={'asc'}
        sortingOrder={'location_name'}
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
