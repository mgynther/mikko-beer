import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Style from './Style'
import LinkWrapper from '../LinkWrapper'
import type {
  GetStyleStatsIf,
  StyleStatsQueryParams
} from '../../core/stats/types'
import { openFilters } from './filters-test-util'
import type { SearchParameters } from '../util'

const breweryId = 'd02852f6-8cef-40fd-9dfd-2cf5489de63e'
const styleId = '4169b690-b1ab-4385-84ce-2fae277d7dd5'

const pils = {
  styleId: '14142347-762b-4b4b-b657-731a19ec5eb8',
  styleName: 'Pils',
  reviewAverage: '8.73',
  reviewCount: '72'
}

const ipa = {
  styleId: '6cf37273-2f07-47a2-b987-b5a54e292e60',
  styleName: 'IPA',
  reviewAverage: '8.91',
  reviewCount: '92'
}

const statsResult = {
  stats: {
    style: [ipa, pils],
  },
  isLoading: false
}

const defaultParams = {
  breweryId: undefined,
  maxReviewAverage: 10,
  maxReviewCount: Infinity,
  minReviewAverage: 4.0,
  minReviewCount: 1,
  sorting: {
    direction: 'asc',
    order: 'style_name',
  },
  styleId: undefined
}

const getRecordingIf = (
  statsRequests: (params: StyleStatsQueryParams) => void
): GetStyleStatsIf => ({
  useStats: (params: StyleStatsQueryParams) => {
    statsRequests(params)
    return statsResult
  }
})

const emptySearchParameters: SearchParameters = {
  get: () => undefined
}

const noOpSetState = (): undefined => undefined

const defaultSearchParams: Record<string, string> = {
  sorting_order: 'style_name',
  list_direction: 'asc',
  min_review_count: '1',
  max_review_count: 'Infinity',
  min_review_average: '4.00',
  max_review_average: '10.00',
}

function toSearchParams (record: Record<string, string>): SearchParameters {
  return {
    get: (name: string) => record[name]
  }
}

test('renders style stats', () => {
  const { getByText } = render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={{
          useStats: () => statsResult
        }}
        breweryId={undefined}
        search={emptySearchParameters}
        setState={noOpSetState}
        styleId={undefined}
      />
    </LinkWrapper>
  )
  getByText(pils.styleName)
  getByText(pils.reviewAverage)
  getByText(pils.reviewCount)
  getByText(ipa.styleName)
  getByText(ipa.reviewAverage)
  getByText(ipa.reviewCount)
})

test('applies filters', () => {
  const statsRequests = vitest.fn()
  const searchRecord: Record<string, string> = {
    sorting_order: 'average',
    list_direction: 'desc',
    min_review_count: '5',
    max_review_count: '13',
    min_review_average: '8.50',
    max_review_average: '8.90',
  }
  render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={getRecordingIf(statsRequests)}
        breweryId={breweryId}
        search={toSearchParams(searchRecord)}
        setState={noOpSetState}
        styleId={styleId}
      />
    </LinkWrapper>
  )
  const calls = statsRequests.mock.calls
  expect(calls.length).toEqual(1)
  expect(calls[0]).toEqual([{
    breweryId,
    minReviewCount: 5,
    maxReviewCount: 13,
    minReviewAverage: 8.5,
    maxReviewAverage: 8.9,
    sorting: {
      direction: 'desc',
      order: 'average'
    },
    styleId
  }])
})

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
    const user = userEvent.setup()
    const statsRequests = vitest.fn()
    const setState = vitest.fn()
    const { getByDisplayValue, getByRole } = render(
      <LinkWrapper>
        <Style
          getStyleStatsIf={getRecordingIf(statsRequests)}
          breweryId={undefined}
          search={toSearchParams(defaultSearchParams)}
          setState={setState}
          styleId={undefined}
        />
      </LinkWrapper>
    )
    await openFilters(getByRole, user)
    changeSlider(
      getByDisplayValue,
      testCase.fromDisplayValue,
      testCase.toDisplayValue
    )
    const expected = {
      ...defaultSearchParams,
    }
    expected[testCase.property] = testCase.stateValue
    expect(setState.mock.calls).toEqual([[expected]])
  })
})

test('uses ids', async () => {
  const statsRequests = vitest.fn()
  render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={getRecordingIf(statsRequests)}
        breweryId={breweryId}
        search={emptySearchParameters}
        setState={noOpSetState}
        styleId={styleId}
      />
    </LinkWrapper>
  )
  const calls = statsRequests.mock.calls
  expect(calls.length).toEqual(1)
  expect(calls[0]).toEqual([{
    ...defaultParams,
    breweryId,
    styleId
  }])
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
    originalOrder: 'style_name',
    originalDirection: 'asc',
    buttonText: 'Style ▲',
    newOrder: 'style_name',
    newDirection: 'desc'
  },
  {
    originalOrder: 'style_name',
    originalDirection: 'desc',
    buttonText: 'Style ▼',
    newOrder: 'style_name',
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
    buttonText: 'Style',
    newOrder: 'style_name',
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
    originalOrder: 'style_name',
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
    const statsRequests = vitest.fn()
    const setState = vitest.fn()
    const searchRecord: Record<string, string> = {
      ...defaultSearchParams,
      sorting_order: testCase.originalOrder,
      list_direction: testCase.originalDirection
    }
    const { getByRole } = render(
      <LinkWrapper>
        <Style
          getStyleStatsIf={getRecordingIf(statsRequests)}
          breweryId={undefined}
          search={toSearchParams(searchRecord)}
          setState={setState}
          styleId={undefined}
        />
      </LinkWrapper>
    )
    const orderButton = getByRole('button', { name: testCase.buttonText })
    await user.click(orderButton)
    const calls = setState.mock.calls
    expect(calls.length).toEqual(1)
    expect(calls[0]).toEqual([{
      ...defaultSearchParams,
      sorting_order: testCase.newOrder,
      list_direction: testCase.newDirection
    }])
  })
})
