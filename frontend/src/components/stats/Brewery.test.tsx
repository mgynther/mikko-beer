import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Brewery from './Brewery'
import LinkWrapper from '../LinkWrapper'
import type { SearchParameters } from '../util'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const koskipanimo = {
  breweryId: 'ad11fad9-951a-473f-9c2e-88084589c4f7',
  breweryName: 'Koskipanimo',
  reviewAverage: '9.06',
  reviewCount: '63',
  reviewedBeerCount: '62'
}

const lehe = {
  breweryId: '1d6505ea-9cbd-4215-bc5c-bd80b2a27af8',
  breweryName: 'Lehe pruulikoda',
  reviewAverage: '9.71',
  reviewCount: '24',
  reviewedBeerCount: '24'
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

const breweryStats = { brewery: [{ ...koskipanimo }, { ...lehe }]}
const emptyStats = { brewery: []}

const usedStats = {
  useStats: () => ({
    query: async () => breweryStats,
    stats: emptyStats,
    isLoading: false
  }),
  infiniteScroll: (cb: () => void) => {
    cb()
    return () => undefined
  }
}

const emptySearchParameters: SearchParameters = {
  get: () => undefined
}

const noOpSetState = (): undefined => undefined

test('queries brewery stats', async () => {
  const query = vitest.fn()
  let loadCallback: () => void = () => undefined
  render(
    <LinkWrapper>
      <Brewery
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
        breweryId={undefined}
        locationId={undefined}
        search={emptySearchParameters}
        setState={noOpSetState}
        styleId={undefined}
      />
    </LinkWrapper>
  )
  expect(query.mock.calls).toEqual([])
  await act(async() => { loadCallback(); })
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
})

test('renders brewery stats', async () => {
  const { getByText } = render(
    <LinkWrapper>
      <Brewery
        breweryId={'5e2f90e7-15f9-499d-baa3-c95f4282c509'}
        locationId={'15881313-7b69-415b-ad1c-3e4ce3a00fae'}
        search={emptySearchParameters}
        setState={noOpSetState}
        styleId={undefined}
        getBreweryStatsIf={usedStats}
      />
    </LinkWrapper>
  )
  await waitFor(() => getByText(koskipanimo.breweryName))
  getByText(koskipanimo.reviewAverage)
  getByText(`${koskipanimo.reviewCount} (${koskipanimo.reviewedBeerCount})`)
  getByText(lehe.breweryName)
  getByText(lehe.reviewAverage)
  getByText(lehe.reviewCount)
})

const defaultSearchParams: Record<string, string> = {
  filters_open: '0',
  sorting_order: 'brewery_name',
  list_direction: 'asc',
  min_review_count: '1',
  max_review_count: 'Infinity',
  min_review_average: '4.00',
  max_review_average: '10.00',
}

const defaultFiltersOpenParams: Record<string, string> = {
  ...defaultSearchParams,
  filters_open: '1'
}

function toSearchParams (record: Record<string, string>): SearchParameters  {
  return {
    get: (name: string) => record[name]
  }
}

function changeSlider (
  getByDisplayValue: (str: string) => HTMLElement,
  from: string,
  to: string
): void {
  const slider = getByDisplayValue(from)
  fireEvent.change(slider, {target: { value: to }})
}

interface SliderChangeTest {
  fromDisplayValue: string
  toDisplayValue: string
  property: string
  stateValue: string
}

const sliderChangeTests: SliderChangeTest[] = [
  {
    fromDisplayValue: '4',
    toDisplayValue: '8.1',
    property: 'min_review_average',
    stateValue: '8.10'
  },
  {
    fromDisplayValue: '10',
    toDisplayValue: '8.0',
    property: 'max_review_average',
    stateValue: '8.00'
  },
  {
    fromDisplayValue: '0',
    toDisplayValue: '5',
    property: 'min_review_count',
    stateValue: '13'
  },
  {
    fromDisplayValue: '11',
    toDisplayValue: '5',
    property: 'max_review_count',
    stateValue: '13'
  }
]

sliderChangeTests.forEach(testCase => {
  test(`change ${testCase.property}`, async () => {
    const setState = vitest.fn()
    const { getByDisplayValue } = render(
      <LinkWrapper>
        <Brewery
          breweryId={undefined}
          locationId={undefined}
          search={toSearchParams(defaultFiltersOpenParams)}
          setState={setState}
          styleId={'dcbc0cd8-337a-4c0c-8ae6-baf97f711680'}
          getBreweryStatsIf={usedStats}
        />
      </LinkWrapper>
    )
    await act(async () => {
      changeSlider(
        getByDisplayValue,
        testCase.fromDisplayValue,
        testCase.toDisplayValue
      )
    })
    const expected = {
      ...defaultFiltersOpenParams,
    }
    expected[testCase.property] = testCase.stateValue
    expect(setState.mock.calls).toEqual([[expected]])
  })
})

interface OrderChangeTest {
  originalOrder: string
  originalDirection: string
  buttonText: string
  newOrder: string
  newDirection: string
}

const orderChangeTests: OrderChangeTest[] = [
  {
    originalOrder: 'brewery_name',
    originalDirection: 'asc',
    buttonText: 'Brewery ▲',
    newOrder: 'brewery_name',
    newDirection: 'desc'
  },
  {
    originalOrder: 'brewery_name',
    originalDirection: 'desc',
    buttonText: 'Brewery ▼',
    newOrder: 'brewery_name',
    newDirection: 'asc'
  },
  {
    originalOrder: 'count',
    originalDirection: 'asc',
    buttonText: 'Reviews ▲',
    newOrder: 'count',
    newDirection: 'desc'
  },
  {
    originalOrder: 'count',
    originalDirection: 'desc',
    buttonText: 'Reviews ▼',
    newOrder: 'count',
    newDirection: 'asc'
  },
  {
    originalOrder: 'average',
    originalDirection: 'asc',
    buttonText: 'Average ▲',
    newOrder: 'average',
    newDirection: 'desc'
  },
  {
    originalOrder: 'average',
    originalDirection: 'desc',
    buttonText: 'Average ▼',
    newOrder: 'average',
    newDirection: 'asc'
  },
  {
    originalOrder: 'average',
    originalDirection: 'desc',
    buttonText: 'Brewery',
    newOrder: 'brewery_name',
    newDirection: 'asc'
  },
  {
    originalOrder: 'average',
    originalDirection: 'desc',
    buttonText: 'Reviews',
    newOrder: 'count',
    newDirection: 'desc'
  },
  {
    originalOrder: 'brewery_name',
    originalDirection: 'desc',
    buttonText: 'Average',
    newOrder: 'average',
    newDirection: 'desc'
  }
]

orderChangeTests.forEach(testCase => {
  test(`change ${testCase.originalOrder} ${testCase.originalDirection} to ${
    testCase.newOrder} ${testCase.newDirection
  }`, async () => {
    const user = userEvent.setup()
    const setState = vitest.fn()
    const searchRecord: Record<string, string> = {
      ...defaultSearchParams,
      sorting_order: testCase.originalOrder,
      list_direction: testCase.originalDirection
    }
    const { getByRole } = render(
      <LinkWrapper>
        <Brewery
          breweryId={undefined}
          locationId={undefined}
          search={toSearchParams(searchRecord)}
          setState={setState}
          styleId={'dcbc0cd8-337a-4c0c-8ae6-baf97f711680'}
          getBreweryStatsIf={usedStats}
        />
      </LinkWrapper>
    )
    const button = getByRole('button', { name: testCase.buttonText })
    await user.click(button)
    const expected = {
      ...defaultSearchParams,
      sorting_order: testCase.newOrder,
      list_direction: testCase.newDirection
    }
    expect(setState.mock.calls).toEqual([[expected]])
  })
})
