import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import Style from './Style'
import LinkWrapper from '../LinkWrapper'
import type {
  GetStyleStatsIf,
  OneStyleStats,
  StatsResult,
  StyleStatsQueryParams,
} from '../../core/stats/types'
import { openFilters } from '../common/filters-test-util'
import type { SearchParameters } from '../util'
import type { UseDebounce, YearMonth } from '../../core/types'

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const breweryId = 'd02852f6-8cef-40fd-9dfd-2cf5489de63e'
const locationId = '1da527ec-5eb7-452b-99dc-d8c3cffcd63f'
const styleId = '4169b690-b1ab-4385-84ce-2fae277d7dd5'

const pils: OneStyleStats = {
  styleId: '14142347-762b-4b4b-b657-731a19ec5eb8',
  styleName: 'Pils',
  reviewAverage: '8.73',
  reviewCount: '72',
  reviewMedian: '8.00',
  reviewMode: '8',
  reviewStandardDeviation: '0.38',
}

const ipa: OneStyleStats = {
  styleId: '6cf37273-2f07-47a2-b987-b5a54e292e60',
  styleName: 'IPA',
  reviewAverage: '8.91',
  reviewCount: '92',
  reviewMedian: '8.50',
  reviewMode: '9',
  reviewStandardDeviation: '0.54',
}

const statsResult = {
  stats: {
    style: [ipa, pils],
  },
  isLoading: false,
}

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const defaultParams = {
  breweryId: undefined,
  locationId: undefined,
  maxReviewAverage: 10,
  maxReviewCount: Infinity,
  minReviewAverage: 4.0,
  minReviewCount: 1,
  sorting: {
    direction: 'asc',
    order: 'style_name',
  },
  styleId: undefined,
  timeStart: testTimes.min.utcTimestamp,
  timeEnd: testTimes.max.utcTimestamp,
}

const getRecordingIf = (
  statsRequests: (params: StyleStatsQueryParams) => void,
): GetStyleStatsIf => ({
  useStats: (params: StyleStatsQueryParams): StatsResult => {
    statsRequests(params)
    return statsResult
  },
  minTime,
  maxTime,
  getUseDebounce,
})

const styleStatsIf: GetStyleStatsIf = {
  useStats: () => statsResult,
  minTime,
  maxTime,
  getUseDebounce,
}

const emptySearchParameters: SearchParameters = {
  get: () => undefined,
}

const noOpSetState = (): undefined => undefined

const defaultSearchParams: Record<string, string> = {
  s_filters: '0',
  s_order: 'style_name',
  s_direction: 'asc',
  s_min_count: '1',
  s_max_count: 'Infinity',
  s_min_avg: '4.00',
  s_max_avg: '10.00',
  s_time_start: testTimes.min.text,
  s_time_end: testTimes.max.text,
}

const defaultFiltersOpenParams: Record<string, string> = {
  ...defaultSearchParams,
  s_filters: '1',
}

function toSearchParams(record: Record<string, string>): SearchParameters {
  return {
    get: (name: string) => record[name],
  }
}

test('renders style stats', () => {
  const { getByText } = render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={{
          useStats: () => statsResult,
          minTime,
          maxTime,
          getUseDebounce,
        }}
        breweryId={undefined}
        locationId={undefined}
        search={emptySearchParameters}
        setState={noOpSetState}
        styleId={undefined}
      />
    </LinkWrapper>,
  )
  getByText(pils.styleName)
  getByText(pils.reviewAverage)
  getByText(pils.reviewCount)
  getByText(pils.reviewMedian)
  getByText(pils.reviewMode)
  getByText(pils.reviewStandardDeviation)
  getByText(ipa.styleName)
  getByText(ipa.reviewAverage)
  getByText(ipa.reviewCount)
  getByText(ipa.reviewMedian)
  getByText(ipa.reviewMode)
  getByText(ipa.reviewStandardDeviation)
})

test('applies filters', () => {
  const statsRequests = vitest.fn()
  const searchRecord: Record<string, string> = {
    s_order: 'average',
    s_direction: 'desc',
    s_min_count: '5',
    s_max_count: '13',
    s_min_avg: '8.50',
    s_max_avg: '8.90',
  }
  render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={getRecordingIf(statsRequests)}
        breweryId={breweryId}
        locationId={locationId}
        search={toSearchParams(searchRecord)}
        setState={noOpSetState}
        styleId={styleId}
      />
    </LinkWrapper>,
  )
  const calls = statsRequests.mock.calls
  expect(calls.length).toEqual(1)
  expect(calls[0]).toEqual([
    {
      breweryId,
      locationId,
      minReviewCount: 5,
      maxReviewCount: 13,
      minReviewAverage: 8.5,
      maxReviewAverage: 8.9,
      sorting: {
        direction: 'desc',
        order: 'average',
      },
      styleId,
      timeStart: testTimes.min.utcTimestamp,
      timeEnd: testTimes.max.utcTimestamp,
    },
  ])
})

test('opens filters', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <Style
        getStyleStatsIf={styleStatsIf}
        breweryId={undefined}
        locationId={undefined}
        search={toSearchParams(defaultSearchParams)}
        setState={setState}
        styleId={undefined}
      />
    </LinkWrapper>,
  )
  await openFilters(getByRole, user)
  expect(setState.mock.calls).toEqual([
    [
      {
        ...defaultSearchParams,
        s_filters: '1',
      },
    ],
  ])
})

function changeSlider(
  getByLabelText: (str: string) => HTMLElement,
  label: string,
  to: string,
): void {
  const slider = getByLabelText(label)
  fireEvent.change(slider, { target: { value: to } })
}

interface SliderChangeTest {
  label: string
  toDisplayValue: string
  property: string
  stateValue: string
}

const sliderChangeTests: SliderChangeTest[] = [
  {
    label: 'Minimum review average: 4',
    toDisplayValue: '8.1',
    property: 's_min_avg',
    stateValue: '8.10',
  },
  {
    label: 'Maximum review average: 10',
    toDisplayValue: '8.0',
    property: 's_max_avg',
    stateValue: '8.00',
  },
  {
    label: 'Minimum review count: 1',
    toDisplayValue: '5',
    property: 's_min_count',
    stateValue: '13',
  },
  {
    label: 'Maximum review count: ∞',
    toDisplayValue: '5',
    property: 's_max_count',
    stateValue: '13',
  },
  {
    label: 'Minimum time: 2017-12',
    toDisplayValue: '5',
    property: 's_time_start',
    stateValue: '2018-05',
  },
  {
    label: 'Maximum time: 2024-12',
    toDisplayValue: '8',
    property: 's_time_end',
    stateValue: '2018-08',
  },
]

sliderChangeTests.forEach((testCase) => {
  test(`change ${testCase.property}`, async () => {
    const setState = vitest.fn()
    const { getByLabelText } = render(
      <LinkWrapper>
        <Style
          getStyleStatsIf={styleStatsIf}
          breweryId={undefined}
          locationId={undefined}
          search={toSearchParams(defaultFiltersOpenParams)}
          setState={setState}
          styleId={undefined}
        />
      </LinkWrapper>,
    )
    changeSlider(getByLabelText, testCase.label, testCase.toDisplayValue)
    const expected = {
      ...defaultFiltersOpenParams,
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
        locationId={locationId}
        search={emptySearchParameters}
        setState={noOpSetState}
        styleId={styleId}
      />
    </LinkWrapper>,
  )
  const calls = statsRequests.mock.calls
  expect(calls.length).toEqual(1)
  expect(calls[0]).toEqual([
    {
      ...defaultParams,
      breweryId,
      locationId,
      styleId,
    },
  ])
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
    newDirection: 'desc',
  },
  {
    originalOrder: 'style_name',
    originalDirection: 'desc',
    buttonText: 'Style ▼',
    newOrder: 'style_name',
    newDirection: 'asc',
  },
  {
    originalOrder: 'count',
    originalDirection: 'asc',
    buttonText: 'n ▲',
    newOrder: 'count',
    newDirection: 'desc',
  },
  {
    originalOrder: 'count',
    originalDirection: 'desc',
    buttonText: 'n ▼',
    newOrder: 'count',
    newDirection: 'asc',
  },
  {
    originalOrder: 'average',
    originalDirection: 'asc',
    buttonText: 'Avg ▲',
    newOrder: 'average',
    newDirection: 'desc',
  },
  {
    originalOrder: 'average',
    originalDirection: 'desc',
    buttonText: 'Avg ▼',
    newOrder: 'average',
    newDirection: 'asc',
  },
  {
    originalOrder: 'std_dev',
    originalDirection: 'asc',
    buttonText: 'σ ▲',
    newOrder: 'std_dev',
    newDirection: 'desc',
  },
  {
    originalOrder: 'std_dev',
    originalDirection: 'desc',
    buttonText: 'σ ▼',
    newOrder: 'std_dev',
    newDirection: 'asc',
  },
  {
    originalOrder: 'average',
    originalDirection: 'desc',
    buttonText: 'Style',
    newOrder: 'style_name',
    newDirection: 'asc',
  },
  {
    originalOrder: 'average',
    originalDirection: 'desc',
    buttonText: 'n',
    newOrder: 'count',
    newDirection: 'desc',
  },
  {
    originalOrder: 'style_name',
    originalDirection: 'desc',
    buttonText: 'Avg',
    newOrder: 'average',
    newDirection: 'desc',
  },
  {
    originalOrder: 'average',
    originalDirection: 'desc',
    buttonText: 'σ',
    newOrder: 'std_dev',
    newDirection: 'desc',
  },
]

orderChangeTests.forEach((testCase) => {
  test(`change ${testCase.originalOrder} ${testCase.originalDirection} to ${
    testCase.newOrder
  } ${testCase.newDirection}`, async () => {
    const user = userEvent.setup()
    const setState = vitest.fn()
    const searchRecord: Record<string, string> = {
      ...defaultSearchParams,
      s_order: testCase.originalOrder,
      s_direction: testCase.originalDirection,
    }
    const { getByRole } = render(
      <LinkWrapper>
        <Style
          getStyleStatsIf={styleStatsIf}
          breweryId={undefined}
          locationId={undefined}
          search={toSearchParams(searchRecord)}
          setState={setState}
          styleId={undefined}
        />
      </LinkWrapper>,
    )
    const orderButton = getByRole('button', { name: testCase.buttonText })
    await user.click(orderButton)
    const calls = setState.mock.calls
    expect(calls.length).toEqual(1)
    expect(calls[0]).toEqual([
      {
        ...defaultSearchParams,
        s_order: testCase.newOrder,
        s_direction: testCase.newDirection,
      },
    ])
  })
})
