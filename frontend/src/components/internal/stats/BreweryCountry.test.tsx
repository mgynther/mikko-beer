import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { setupUser } from '../../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../../test-util/filter-time'
import BreweryCountry from './BreweryCountry'
import type {
  BreweryCountryStats,
  GetBreweryCountryStatsIf,
  OneBreweryCountryStats,
} from '../../types/stats/types'
import type {
  SearchParameters,
  UseDebounce,
  YearMonth,
} from '../../types/types'
import type { StatsFilters } from './filter-types'
import { dontCall } from '../../../../test-util/dont-call'

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

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

const breweryCountryStats = {
  breweryCountry: [{ ...finland }, { ...estonia }],
}
const emptyStats = { breweryCountry: [] }

const usedStats: GetBreweryCountryStatsIf = {
  useStats: () => ({
    query: async () => breweryCountryStats,
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

test('queries brewery country stats', async () => {
  const query = vitest.fn()
  let loadCallback: () => void = () => undefined
  render(
    <BreweryCountry
      getBreweryCountryStatsIf={{
        useStats: () => ({
          query: async (params): Promise<BreweryCountryStats> => {
            query(params)
            return {
              breweryCountry: [{ ...finland }, { ...estonia }],
            }
          },
          stats: {
            breweryCountry: [],
          },
          isLoading: false,
        }),
        infiniteScroll: (cb) => {
          loadCallback = cb
          return (): undefined => undefined
        },
        minTime,
        maxTime,
        getUseDebounce,
      }}
      breweryId={undefined}
      locationId={undefined}
      search={emptySearchParameters}
      setState={noOpSetState}
      styleId={undefined}
    />,
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
          order: 'country_code',
        },
        styleId: undefined,
        timeStart: testTimes.min.utcTimestamp,
        timeEnd: testTimes.max.utcTimestamp,
      },
    ],
  ])
})

test('renders brewery country stats', async () => {
  const { getByText } = render(
    <BreweryCountry
      breweryId={'5e2f90e7-15f9-499d-baa3-c95f4282c509'}
      locationId={'15881313-7b69-415b-ad1c-3e4ce3a00fae'}
      search={emptySearchParameters}
      setState={noOpSetState}
      styleId={undefined}
      getBreweryCountryStatsIf={usedStats}
    />,
  )
  await waitFor(() => getByText(finland.countryCode))
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
})

const defaultSearchParams: Record<string, string> = {
  s_filters: '0',
  s_order: 'country_code',
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
      <BreweryCountry
        breweryId={undefined}
        locationId={undefined}
        search={toSearchParams(defaultFiltersOpenParams)}
        setState={setState}
        styleId={'dcbc0cd8-337a-4c0c-8ae6-baf97f711680'}
        getBreweryCountryStatsIf={usedStats}
      />,
    )
    await act(async () => {
      changeSlider(getByLabelText, testCase.label, testCase.toDisplayValue)
    })
    const expected = {
      ...defaultFiltersOpenParams,
    }
    expected[testCase.property] = testCase.stateValue
    expect(setState.mock.calls).toEqual([
      [defaultFiltersOpenParams],
      [expected],
    ])
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
    originalOrder: 'country_code',
    originalDirection: 'asc',
    buttonText: 'Country ▲',
    newOrder: 'country_code',
    newDirection: 'desc',
  },
  {
    originalOrder: 'country_code',
    originalDirection: 'desc',
    buttonText: 'Country ▼',
    newOrder: 'country_code',
    newDirection: 'asc',
  },
  {
    originalOrder: 'count',
    originalDirection: 'asc',
    buttonText: 'Rvw n ▲',
    newOrder: 'count',
    newDirection: 'desc',
  },
  {
    originalOrder: 'count',
    originalDirection: 'desc',
    buttonText: 'Rvw n ▼',
    newOrder: 'count',
    newDirection: 'asc',
  },
  {
    originalOrder: 'brewery_count',
    originalDirection: 'asc',
    buttonText: 'Brwr n ▲',
    newOrder: 'brewery_count',
    newDirection: 'desc',
  },
  {
    originalOrder: 'brewery_count',
    originalDirection: 'desc',
    buttonText: 'Brwr n ▼',
    newOrder: 'brewery_count',
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
    buttonText: 'Country',
    newOrder: 'country_code',
    newDirection: 'asc',
  },
  {
    originalOrder: 'average',
    originalDirection: 'desc',
    buttonText: 'Rvw n',
    newOrder: 'count',
    newDirection: 'desc',
  },
  {
    originalOrder: 'average',
    originalDirection: 'desc',
    buttonText: 'Brwr n',
    newOrder: 'brewery_count',
    newDirection: 'desc',
  },
  {
    originalOrder: 'country_code',
    originalDirection: 'desc',
    buttonText: 'Avg',
    newOrder: 'average',
    newDirection: 'desc',
  },
  {
    originalOrder: 'country_code',
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
    const user = setupUser()
    const setState = vitest.fn()
    const searchRecord: Record<string, string> = {
      ...defaultSearchParams,
      s_order: testCase.originalOrder,
      s_direction: testCase.originalDirection,
    }
    const { getByRole } = render(
      <BreweryCountry
        breweryId={undefined}
        locationId={undefined}
        search={toSearchParams(searchRecord)}
        setState={setState}
        styleId={'dcbc0cd8-337a-4c0c-8ae6-baf97f711680'}
        getBreweryCountryStatsIf={usedStats}
      />,
    )
    const button = getByRole('button', { name: testCase.buttonText })
    await user.click(button)
    const expected = {
      ...defaultSearchParams,
      s_order: testCase.newOrder,
      s_direction: testCase.newDirection,
    }
    expect(setState.mock.calls).toEqual([[searchRecord], [expected]])
  })
})

test('falls back to the default sorting order', async () => {
  const setState = vitest.fn()
  render(
    <BreweryCountry
      breweryId={undefined}
      locationId={undefined}
      search={toSearchParams({
        ...defaultSearchParams,
        s_order: 'unknown',
      })}
      setState={setState}
      styleId={'dcbc0cd8-337a-4c0c-8ae6-baf97f711680'}
      getBreweryCountryStatsIf={usedStats}
    />,
  )
  await waitFor(() => {
    expect(setState.mock.calls).toEqual([[defaultSearchParams]])
  })
})
