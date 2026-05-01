import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import Location from './Location'
import LinkWrapper from '../LinkWrapper'
import type { SearchParameters } from '../util'
import type {
  GetLocationStatsIf,
  LocationStats,
  OneLocationStats,
  YearMonth,
} from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'
import { openFilters } from './filters-test-util'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const plevna: OneLocationStats = {
  locationId: '18d3ffce-1b24-47c5-9174-8a8b002822de',
  locationName: 'Plevna',
  reviewAverage: '9.06',
  reviewCount: '63',
  reviewMedian: '9.50',
  reviewMode: '10',
  reviewStandardDeviation: '0.78',
}

const oluthuone: OneLocationStats = {
  locationId: 'bdf26fa0-6af4-44f0-b9fa-4f39d5ed8a46',
  locationName: 'Oluthuone Panimomestari',
  reviewAverage: '9.71',
  reviewCount: '24',
  reviewMedian: '9.00',
  reviewMode: '9',
  reviewStandardDeviation: '0.44',
}

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const unusedFilters = {
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

const locationStats = { location: [{ ...plevna }, { ...oluthuone }] }
const emptyStats = { location: [] }

const usedStats: GetLocationStatsIf = {
  useStats: () => ({
    query: async () => locationStats,
    stats: emptyStats,
    isLoading: false,
  }),
  infiniteScroll: (cb: () => void) => {
    cb()
    return () => undefined
  },
  minTime,
  maxTime,
  getUseDebounce,
}

const emptySearchParameters: SearchParameters = {
  get: () => undefined,
}

const noOpSetState = (): undefined => undefined

test('queries location stats', async () => {
  const query = vitest.fn()
  let loadCallback: () => void = () => undefined
  const getLocationStatsIf: GetLocationStatsIf = {
    useStats: () => ({
      query: async (params): Promise<LocationStats> => {
        query(params)
        return {
          location: [{ ...plevna }, { ...oluthuone }],
        }
      },
      stats: {
        location: [],
      },
      isLoading: false,
    }),
    infiniteScroll: (cb) => {
      loadCallback = cb
      return () => undefined
    },
    minTime,
    maxTime,
    getUseDebounce,
  }
  render(
    <LinkWrapper>
      <Location
        getLocationStatsIf={getLocationStatsIf}
        breweryId={undefined}
        locationId={undefined}
        search={emptySearchParameters}
        setState={noOpSetState}
        styleId={undefined}
      />
    </LinkWrapper>,
  )
  expect(query.mock.calls).toEqual([])
  await act(async () => {
    loadCallback()
  })
  expect(query.mock.calls).toEqual([
    [
      {
        breweryId: undefined,
        locationId: undefined,
        maxReviewAverage: unusedFilters.maxReviewAverage.value,
        maxReviewCount: unusedFilters.maxReviewCount.value,
        minReviewAverage: unusedFilters.minReviewAverage.value,
        minReviewCount: unusedFilters.minReviewCount.value,
        pagination: {
          size: 30,
          skip: 0,
        },
        sorting: {
          direction: 'asc',
          order: 'location_name',
        },
        styleId: undefined,
        timeStart: testTimes.min.utcTimestamp,
        timeEnd: testTimes.max.utcTimestamp,
      },
    ],
  ])
})

test('queries filtered location stats', async () => {
  const query = vitest.fn()
  const breweryId = '4737b7ed-6c81-4320-9922-a2e32614f903'
  const locationId = '434a13d1-63d4-47e2-bb22-ee1cb4bd37df'
  const styleId = 'e2e4f56d-f433-4c1d-bdbb-c980bc8b3f42'
  let loadCallback: () => void = () => undefined
  const getLocationStatsIf: GetLocationStatsIf = {
    useStats: () => ({
      query: async (params): Promise<LocationStats> => {
        query(params)
        return {
          location: [{ ...plevna }, { ...oluthuone }],
        }
      },
      stats: {
        location: [],
      },
      isLoading: false,
    }),
    infiniteScroll: (cb) => {
      loadCallback = cb
      return () => undefined
    },
    minTime,
    maxTime,
    getUseDebounce,
  }
  render(
    <LinkWrapper>
      <Location
        getLocationStatsIf={getLocationStatsIf}
        breweryId={breweryId}
        locationId={locationId}
        search={emptySearchParameters}
        setState={noOpSetState}
        styleId={styleId}
      />
    </LinkWrapper>,
  )
  await act(async () => {
    loadCallback()
  })
  expect(query.mock.calls).toEqual([
    [
      {
        breweryId,
        locationId,
        maxReviewAverage: unusedFilters.maxReviewAverage.value,
        maxReviewCount: unusedFilters.maxReviewCount.value,
        minReviewAverage: unusedFilters.minReviewAverage.value,
        minReviewCount: unusedFilters.minReviewCount.value,
        pagination: {
          size: 10000,
          skip: 0,
        },
        sorting: {
          direction: 'asc',
          order: 'location_name',
        },
        styleId,
        timeStart: testTimes.min.utcTimestamp,
        timeEnd: testTimes.max.utcTimestamp,
      },
    ],
  ])
})

test('renders location stats', async () => {
  const { getByText } = render(
    <LinkWrapper>
      <Location
        breweryId={'b32ac679-982d-41a1-b39a-8cf50c4d768e'}
        locationId={'6707586e-f94e-4f35-a8f1-1d8586d9c2f3'}
        search={emptySearchParameters}
        setState={noOpSetState}
        styleId={undefined}
        getLocationStatsIf={usedStats}
      />
    </LinkWrapper>,
  )
  await waitFor(() => getByText(plevna.locationName))
  getByText(plevna.reviewAverage)
  getByText(plevna.reviewCount)
  getByText(plevna.reviewMedian)
  getByText(plevna.reviewMode)
  getByText(plevna.reviewStandardDeviation)
  getByText(oluthuone.locationName)
  getByText(oluthuone.reviewAverage)
  getByText(oluthuone.reviewCount)
  getByText(oluthuone.reviewMedian)
  getByText(oluthuone.reviewMode)
  getByText(oluthuone.reviewStandardDeviation)
})

const defaultSearchParams: Record<string, string> = {
  filters_open: '0',
  sorting_order: 'location_name',
  list_direction: 'asc',
  min_review_count: '1',
  max_review_count: 'Infinity',
  min_review_average: '4.00',
  max_review_average: '10.00',
  time_start: testTimes.min.text,
  time_end: testTimes.max.text,
}

const defaultFiltersOpenParams: Record<string, string> = {
  ...defaultSearchParams,
  filters_open: '1',
}

function toSearchParams(record: Record<string, string>): SearchParameters {
  return {
    get: (name: string) => record[name],
  }
}

function changeSlider(
  getByLabelText: (str: string) => HTMLElement,
  from: string,
  to: string,
): void {
  const slider = getByLabelText(from)
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
    property: 'min_review_average',
    stateValue: '8.10',
  },
  {
    label: 'Maximum review average: 10',
    toDisplayValue: '8.0',
    property: 'max_review_average',
    stateValue: '8.00',
  },
  {
    label: 'Minimum review count: 1',
    toDisplayValue: '5',
    property: 'min_review_count',
    stateValue: '13',
  },
  {
    label: 'Maximum review count: ∞',
    toDisplayValue: '5',
    property: 'max_review_count',
    stateValue: '13',
  },
  {
    label: 'Minimum time: 2017-12',
    toDisplayValue: '5',
    property: 'time_start',
    stateValue: '2018-05',
  },
  {
    label: 'Maximum time: 2024-12',
    toDisplayValue: '8',
    property: 'time_end',
    stateValue: '2018-08',
  },
]

sliderChangeTests.forEach((testCase) => {
  test(`change ${testCase.property}`, async () => {
    const setState = vitest.fn()
    const { getByLabelText } = render(
      <LinkWrapper>
        <Location
          breweryId={undefined}
          locationId={undefined}
          search={toSearchParams(defaultFiltersOpenParams)}
          setState={setState}
          styleId={'dcbc0cd8-337a-4c0c-8ae6-baf97f711680'}
          getLocationStatsIf={usedStats}
        />
      </LinkWrapper>,
    )
    await act(async () => {
      changeSlider(getByLabelText, testCase.label, testCase.toDisplayValue)
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
    originalOrder: 'location_name',
    originalDirection: 'asc',
    buttonText: 'Location ▲',
    newOrder: 'location_name',
    newDirection: 'desc',
  },
  {
    originalOrder: 'location_name',
    originalDirection: 'desc',
    buttonText: 'Location ▼',
    newOrder: 'location_name',
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
    buttonText: 'Location',
    newOrder: 'location_name',
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
    originalOrder: 'location_name',
    originalDirection: 'desc',
    buttonText: 'Avg',
    newOrder: 'average',
    newDirection: 'desc',
  },
  {
    originalOrder: 'location_name',
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
      sorting_order: testCase.originalOrder,
      list_direction: testCase.originalDirection,
    }
    const { getByRole } = render(
      <LinkWrapper>
        <Location
          breweryId={undefined}
          locationId={undefined}
          search={toSearchParams(searchRecord)}
          setState={setState}
          styleId={'dcbc0cd8-337a-4c0c-8ae6-baf97f711680'}
          getLocationStatsIf={usedStats}
        />
      </LinkWrapper>,
    )
    const button = getByRole('button', { name: testCase.buttonText })
    await user.click(button)
    const expected = {
      ...defaultSearchParams,
      sorting_order: testCase.newOrder,
      list_direction: testCase.newDirection,
    }
    expect(setState.mock.calls).toEqual([[expected]])
  })
})

test('opens filters', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <Location
        breweryId={undefined}
        locationId={undefined}
        search={emptySearchParameters}
        setState={setState}
        styleId={'55942ddd-e942-4359-bf34-26cb70a8929c'}
        getLocationStatsIf={usedStats}
      />
    </LinkWrapper>,
  )
  await openFilters(getByRole, user)
  expect(setState).toHaveBeenCalledTimes(1)
  const filtersOpen = setState.mock.calls[0][0].filters_open
  expect(filtersOpen).toEqual('1')
})
