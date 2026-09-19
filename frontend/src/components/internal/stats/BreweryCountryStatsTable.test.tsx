import { fireEvent, render } from '@testing-library/react'
import { setupUser } from '../../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../../test-util/filter-time'
import BreweryCountryStatsTable from './BreweryCountryStatsTable'
import type {
  BreweryCountryStatsSortingOrder,
  OneBreweryCountryStats,
} from '../../types/stats/types'
import type { ListDirection, YearMonth } from '../../types/types'
import { openFilters } from '../../../../test-util/open-filters'
import type { StatsFilters } from './filter-types'
import { dontCall } from '../../../../test-util/dont-call'

const finland: OneBreweryCountryStats = {
  countryCode: 'FI',
  breweryCount: '13',
  reviewAverage: '9.06',
  reviewCount: '63',
  reviewMedian: '9.00',
  reviewMode: '9',
  reviewStandardDeviation: '0.35',
  reviewedBeerCount: '62',
}

const estonia: OneBreweryCountryStats = {
  countryCode: 'EE',
  breweryCount: '4',
  reviewAverage: '9.71',
  reviewCount: '24',
  reviewMedian: '9.50',
  reviewMode: '10',
  reviewStandardDeviation: '0.67',
  reviewedBeerCount: '24',
}

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const unusedFilters: StatsFilters = {
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

test('renders brewery country stats', () => {
  const { getByText } = render(
    <BreweryCountryStatsTable
      breweryCountries={[finland, estonia]}
      isLoading={false}
      sortingDirection={'asc'}
      sortingOrder={'country_code'}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: dontCall,
      }}
    />,
  )
  getByText(finland.countryCode)
  getByText(finland.breweryCount)
  getByText(finland.reviewAverage)
  getByText(`${finland.reviewCount} (${finland.reviewedBeerCount})`)
  getByText(finland.reviewMedian)
  getByText(finland.reviewMode)
  getByText(finland.reviewStandardDeviation)
  getByText(estonia.countryCode)
  getByText(estonia.breweryCount)
  getByText(estonia.reviewAverage)
  getByText(estonia.reviewCount)
  getByText(estonia.reviewMedian)
  getByText(estonia.reviewMode)
  getByText(estonia.reviewStandardDeviation)
  getByText('\u{1F1EB}\u{1F1EE}')
  getByText('\u{1F1EA}\u{1F1EA}')
})

test('opens filters', async () => {
  const user = setupUser()
  const setIsFiltersOpen = vitest.fn()
  const { getByRole } = render(
    <BreweryCountryStatsTable
      breweryCountries={[finland, estonia]}
      isLoading={false}
      sortingDirection={'asc'}
      sortingOrder={'country_code'}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: setIsFiltersOpen,
      }}
    />,
  )
  await openFilters(getByRole, user)
  expect(setIsFiltersOpen.mock.calls).toEqual([[true]])
})

interface OrderTestData {
  buttonText: string
  expectedOrder: BreweryCountryStatsSortingOrder
  order: BreweryCountryStatsSortingOrder
  sortingDirection: ListDirection
  testName: string
}

const orderTests: OrderTestData[] = [
  {
    buttonText: 'Country ▲',
    expectedOrder: 'country_code',
    order: 'country_code',
    sortingDirection: 'asc',
    testName: 'country code, flip order',
  },
  {
    buttonText: 'Country ▼',
    expectedOrder: 'country_code',
    order: 'country_code',
    sortingDirection: 'desc',
    testName: 'country code desc, flip order',
  },
  {
    buttonText: 'Rvw n',
    expectedOrder: 'count',
    order: 'country_code',
    sortingDirection: 'asc',
    testName: 'reviews',
  },
  {
    buttonText: 'Brwr n',
    expectedOrder: 'brewery_count',
    order: 'country_code',
    sortingDirection: 'asc',
    testName: 'breweries',
  },
  {
    buttonText: 'Avg',
    expectedOrder: 'average',
    order: 'country_code',
    sortingDirection: 'asc',
    testName: 'average',
  },
  {
    buttonText: 'σ',
    expectedOrder: 'std_dev',
    order: 'country_code',
    sortingDirection: 'asc',
    testName: 'std_dev',
  },
]

orderTests.forEach((data) => {
  test(`set order to ${data.testName}`, () => {
    const setSortingOrder = vitest.fn()
    const { getByRole } = render(
      <BreweryCountryStatsTable
        breweryCountries={[finland, estonia]}
        isLoading={false}
        sortingDirection={data.sortingDirection}
        sortingOrder={data.order}
        setSortingOrder={setSortingOrder}
        filterState={{
          filters: unusedFilters,
          isOpen: false,
          setIsOpen: dontCall,
        }}
      />,
    )
    const orderButton = getByRole('button', { name: data.buttonText })
    orderButton.click()
    expect(setSortingOrder.mock.calls).toEqual([[data.expectedOrder]])
  })
})

test('sets minimum review count filter', () => {
  const setMinimumReviewCount = vitest.fn()
  const { getByDisplayValue } = render(
    <BreweryCountryStatsTable
      breweryCountries={[finland, estonia]}
      isLoading={false}
      sortingDirection={'asc'}
      sortingOrder={'country_code'}
      setSortingOrder={() => undefined}
      filterState={{
        filters: {
          ...unusedFilters,
          minReviewCount: {
            value: 3,
            setValue: setMinimumReviewCount,
          },
        },
        isOpen: true,
        setIsOpen: dontCall,
      }}
    />,
  )
  const slider = getByDisplayValue('2')
  fireEvent.change(slider, { target: { value: '3' } })
  expect(setMinimumReviewCount.mock.calls).toEqual([[5]])
})
