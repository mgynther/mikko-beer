import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { fireEvent } from '../../../fire-event'
import { setupUser } from '../../../user-event'
import { testTimes } from '../../filter-time'
import BreweryStatsTable from '../../../../src/components/internal/stats/BreweryStatsTable'
import type {
  BreweryStatsSortingOrder,
  OneBreweryStats,
} from '../../../../src/components/types/stats/types'
import type {
  ListDirection,
  YearMonth,
} from '../../../../src/components/types/types'
import { openFilters } from '../../open-filters'
import { dontCall } from '../../../dont-call'
import { testLink } from '../../link'
import { buildStatsFilters } from './builders'

const koskipanimo: OneBreweryStats = {
  breweryId: '9c761e23-0113-4eeb-b2d5-819f1f5345b5',
  breweryName: 'Koskipanimo',
  breweryCountry: 'FI',
  reviewAverage: '9.06',
  reviewCount: '63',
  reviewMedian: '9.00',
  reviewMode: '9',
  reviewStandardDeviation: '0.35',
  reviewedBeerCount: '62',
}

const lehe: OneBreweryStats = {
  breweryId: 'a65d5e2a-7c00-48bb-80f2-14bc89940839',
  breweryName: 'Lehe pruulikoda',
  breweryCountry: 'EE',
  reviewAverage: '9.71',
  reviewCount: '24',
  reviewMedian: '9.50',
  reviewMode: '10',
  reviewStandardDeviation: '0.67',
  reviewedBeerCount: '24',
}

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const unusedFilters = buildStatsFilters()

test('renders brewery stats', () => {
  const { getByText } = render(
    <BreweryStatsTable
      linkComponent={testLink}
      breweries={[koskipanimo, lehe]}
      isLoading={false}
      sortingDirection={'asc'}
      sortingOrder={'brewery_name'}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: dontCall,
      }}
    />,
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
  getByText('\u{1F1EB}\u{1F1EE}')
  getByText('\u{1F1EA}\u{1F1EA}')
})

test('renders brewery stats without country', () => {
  const { queryByText } = render(
    <BreweryStatsTable
      linkComponent={testLink}
      breweries={[{ ...koskipanimo, breweryCountry: undefined }]}
      isLoading={false}
      sortingDirection={'asc'}
      sortingOrder={'brewery_name'}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: dontCall,
      }}
    />,
  )
  assertDeepEqual(queryByText('\u{1F1EB}\u{1F1EE}'), null)
})

test('opens filters', async () => {
  const user = setupUser()
  const setIsFiltersOpen = mockFunction<[isOpen: boolean]>()
  const { getByRole } = render(
    <BreweryStatsTable
      linkComponent={testLink}
      breweries={[koskipanimo, lehe]}
      isLoading={false}
      sortingDirection={'asc'}
      sortingOrder={'brewery_name'}
      setSortingOrder={() => undefined}
      filterState={{
        filters: unusedFilters,
        isOpen: false,
        setIsOpen: setIsFiltersOpen,
      }}
    />,
  )
  await openFilters(getByRole, user)
  assertDeepEqual(setIsFiltersOpen.mock.calls, [[true]])
})

interface OrderTestData {
  buttonText: string
  expectedOrder: BreweryStatsSortingOrder
  order: BreweryStatsSortingOrder
  sortingDirection: ListDirection
  testName: string
}

const orderTests: OrderTestData[] = [
  {
    buttonText: 'Brewery ▲',
    expectedOrder: 'brewery_name',
    order: 'brewery_name',
    sortingDirection: 'asc',
    testName: 'brewery name, flip order',
  },
  {
    buttonText: 'Brewery ▼',
    expectedOrder: 'brewery_name',
    order: 'brewery_name',
    sortingDirection: 'desc',
    testName: 'brewery name desc, flip order',
  },
  {
    buttonText: 'n',
    expectedOrder: 'count',
    order: 'brewery_name',
    sortingDirection: 'asc',
    testName: 'reviews',
  },
  {
    buttonText: 'Avg',
    expectedOrder: 'average',
    order: 'brewery_name',
    sortingDirection: 'asc',
    testName: 'average',
  },
  {
    buttonText: 'σ',
    expectedOrder: 'std_dev',
    order: 'brewery_name',
    sortingDirection: 'asc',
    testName: 'std_dev',
  },
]

orderTests.forEach((data) => {
  test(`set order to ${data.testName}`, () => {
    const setSortingOrder = mockFunction<[order: BreweryStatsSortingOrder]>()
    const { getByRole } = render(
      <BreweryStatsTable
        linkComponent={testLink}
        breweries={[koskipanimo, lehe]}
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
    assertDeepEqual(setSortingOrder.mock.calls, [[data.expectedOrder]])
  })
})

test('sets minimum review count filter', () => {
  const setMinimumReviewCount = mockFunction<[value: number]>()
  const { getByDisplayValue } = render(
    <BreweryStatsTable
      linkComponent={testLink}
      breweries={[koskipanimo, lehe]}
      isLoading={false}
      sortingDirection={'asc'}
      sortingOrder={'brewery_name'}
      setSortingOrder={() => undefined}
      filterState={{
        filters: {
          minReviewCount: {
            value: 3,
            setValue: setMinimumReviewCount,
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
        },
        isOpen: true,
        setIsOpen: dontCall,
      }}
    />,
  )
  const slider = getByDisplayValue('2')
  fireEvent.change(slider, { target: { value: '3' } })
  assertDeepEqual(setMinimumReviewCount.mock.calls, [[5]])
})
