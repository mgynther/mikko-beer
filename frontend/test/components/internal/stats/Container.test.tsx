import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { fireEvent } from '../../../fire-event'
import { setupUser } from '../../../user-event'
import Container from '../../../../src/components/internal/stats/Container'
import type {
  IdParams,
  OneContainerStats,
} from '../../../../src/components/types/stats/types'
import { openFilters } from '../../open-filters'
import type { SearchParameters } from '../../../../src/components/types/types'

const breweryId = 'e6887360-78da-49e2-b876-68477c79c776'
const locationId = '7a2ac8d0-3561-43bd-81ac-b51dd892b9bb'
const styleId = '2b885977-a2fd-43c2-95f9-6b19f3c8054d'

const containerStats: OneContainerStats[] = [
  {
    containerId: 'f6937cf3-e0fa-4c6b-92b5-f374242342f6',
    containerSize: '0.25',
    containerType: 'draft',
    reviewAverage: '7.87',
    reviewCount: '24',
    reviewMedian: '8.00',
    reviewMode: '8',
    reviewStandardDeviation: '0.38',
  },
  {
    containerId: 'f908dc6a-3ed7-49e1-8caf-6ae1b9aac4ff',
    containerSize: '0.33',
    containerType: 'bottle',
    reviewAverage: '8.23',
    reviewCount: '10',
    reviewMedian: '8.50',
    reviewMode: '9',
    reviewStandardDeviation: '0.54',
  },
]

const defaultSearchParams: Record<string, string> = {
  s_filters: '0',
  s_order: 'text',
  s_direction: 'asc',
  s_min_count: '1',
  s_max_count: 'Infinity',
  s_min_avg: '4.00',
  s_max_avg: '10.00',
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

function getDefaultSearchParameters(): SearchParameters {
  return {
    get: (name: string) => defaultSearchParams[name],
  }
}

function renderContainer(
  stats: (params: IdParams) => void,
  setState: (state: Record<string, string>) => void,
  searchParams: SearchParameters,
): ReturnType<typeof render> {
  return render(
    <Container
      getContainerStatsIf={{
        useStats: (params: IdParams) => {
          stats(params)
          return {
            stats: {
              container: containerStats,
            },
            isLoading: false,
          }
        },
      }}
      breweryId={breweryId}
      locationId={locationId}
      search={searchParams}
      setState={setState}
      styleId={styleId}
    />,
  )
}

function renderWithStats(
  stats: (params: IdParams) => void,
): ReturnType<typeof render> {
  return renderContainer(stats, () => undefined, getDefaultSearchParameters())
}

function renderFromRecord(
  record: Record<string, string>,
): ReturnType<typeof render> {
  return renderContainer(
    () => undefined,
    () => undefined,
    toSearchParams(record),
  )
}

function renderFromRecordWithSetState(
  record: Record<string, string>,
  setState: (state: Record<string, string>) => void,
): ReturnType<typeof render> {
  return renderContainer(mockFunction(), setState, toSearchParams(record))
}

test('renders container stats', () => {
  const stats = mockFunction()
  const { getByText } = renderWithStats(stats)
  assertDeepEqual(stats.mock.calls, [[{ breweryId, locationId, styleId }]])
  getByText('7.87')
  getByText('8.00')
  getByText('8')
  getByText('0.38')
  getByText('10')
  getByText('draft 0.25')
  getByText('8.23')
  getByText('8.50')
  getByText('9')
  getByText('0.54')
  getByText('24')
  getByText('bottle 0.33')
})

test('renders container stats with default search', () => {
  const searchRecord: Record<string, string> = {}
  const { getByText } = renderFromRecord(searchRecord)
  getByText('draft 0.25')
  getByText('bottle 0.33')
})

test('filter container stats by min average', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_min_avg: '8.10',
  }
  const { getByText, queryByText } = renderFromRecord(searchRecord)
  assertDeepEqual(queryByText('7.87'), null)
  getByText('8.23')
})

test('filter container stats by max average', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_max_avg: '8.00',
  }
  const { getByText, queryByText } = renderFromRecord(searchRecord)
  getByText('7.87')
  assertDeepEqual(queryByText('8.23'), null)
})

test('filter container stats by min count', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_min_count: '13',
  }
  const { getByText, queryByText } = renderFromRecord(searchRecord)
  assertDeepEqual(queryByText('10'), null)
  getByText('24')
})

test('filter container stats by max count', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_max_count: '13',
  }
  const { getByText, queryByText } = renderFromRecord(searchRecord)
  getByText('10')
  assertDeepEqual(queryByText('24'), null)
})

test('order container stats by average desc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_order: 'average',
    s_direction: 'desc',
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const averages = getAllByText(/7.87|8.23/v)
  assertEqual(averages.length, 2)
  assertEqual(averages[0].innerHTML, '8.23')
  assertEqual(averages[1].innerHTML, '7.87')
})

test('order container stats by average asc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_order: 'average',
    s_direction: 'asc',
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const averages = getAllByText(/7.87|8.23/v)
  assertEqual(averages.length, 2)
  assertEqual(averages[0].innerHTML, '7.87')
  assertEqual(averages[1].innerHTML, '8.23')
})

test('order container stats by count desc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_order: 'count',
    s_direction: 'desc',
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const counts = getAllByText(/10|24/v)
  assertEqual(counts.length, 2)
  assertEqual(counts[0].innerHTML, '24')
  assertEqual(counts[1].innerHTML, '10')
})

test('order container stats by count asc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_order: 'count',
    s_direction: 'asc',
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const counts = getAllByText(/10|24/v)
  assertEqual(counts.length, 2)
  assertEqual(counts[0].innerHTML, '10')
  assertEqual(counts[1].innerHTML, '24')
})

test('order container stats by container desc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_order: 'text',
    s_direction: 'desc',
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const containers = getAllByText(/draft 0.25|bottle 0.33/v)
  assertEqual(containers.length, 2)
  assertEqual(containers[0].innerHTML, 'draft 0.25')
  assertEqual(containers[1].innerHTML, 'bottle 0.33')
})

test('order container stats by container asc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_order: 'text',
    s_direction: 'asc',
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const containers = getAllByText(/draft 0.25|bottle 0.33/v)
  assertEqual(containers.length, 2)
  assertEqual(containers[0].innerHTML, 'bottle 0.33')
  assertEqual(containers[1].innerHTML, 'draft 0.25')
})

test('order container stats by std_dev desc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_order: 'std_dev',
    s_direction: 'desc',
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const counts = getAllByText(/0.38|0.54/v)
  assertEqual(counts.length, 2)
  assertEqual(counts[0].innerHTML, '0.54')
  assertEqual(counts[1].innerHTML, '0.38')
})

test('order container stats by std_dev asc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    s_order: 'std_dev',
    s_direction: 'asc',
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const counts = getAllByText(/0.38|0.54/v)
  assertEqual(counts.length, 2)
  assertEqual(counts[0].innerHTML, '0.38')
  assertEqual(counts[1].innerHTML, '0.54')
})

function changeSlider(
  getByDisplayValue: (str: string) => HTMLElement,
  from: string,
  to: string,
): void {
  const slider = getByDisplayValue(from)
  fireEvent.change(slider, { target: { value: to } })
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
    property: 's_min_avg',
    stateValue: '8.10',
  },
  {
    fromDisplayValue: '10',
    toDisplayValue: '8.0',
    property: 's_max_avg',
    stateValue: '8.00',
  },
  {
    fromDisplayValue: '0',
    toDisplayValue: '5',
    property: 's_min_count',
    stateValue: '13',
  },
  {
    fromDisplayValue: '11',
    toDisplayValue: '5',
    property: 's_max_count',
    stateValue: '13',
  },
]

sliderChangeTests.forEach((testCase) => {
  test(`change ${testCase.property}`, () => {
    const setState = mockFunction()
    const { getByDisplayValue } = renderFromRecordWithSetState(
      defaultFiltersOpenParams,
      setState,
    )
    changeSlider(
      getByDisplayValue,
      testCase.fromDisplayValue,
      testCase.toDisplayValue,
    )
    const expected = {
      ...defaultFiltersOpenParams,
    }
    expected[testCase.property] = testCase.stateValue
    assertDeepEqual(setState.mock.calls, [
      [defaultFiltersOpenParams],
      [expected],
    ])
  })
})

test('opens filters', async () => {
  const user = setupUser()
  const setState = mockFunction()
  const { getByRole } = renderFromRecordWithSetState(
    defaultSearchParams,
    setState,
  )
  await openFilters(getByRole, user)
  assertDeepEqual(setState.mock.calls, [
    [
      {
        ...defaultSearchParams,
      },
    ],
    [
      {
        ...defaultSearchParams,
        s_filters: '1',
      },
    ],
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
    originalOrder: 'text',
    originalDirection: 'asc',
    buttonText: 'Container ▲',
    newOrder: 'text',
    newDirection: 'desc',
  },
  {
    originalOrder: 'text',
    originalDirection: 'desc',
    buttonText: 'Container ▼',
    newOrder: 'text',
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
    buttonText: 'Container',
    newOrder: 'text',
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
    originalOrder: 'text',
    originalDirection: 'desc',
    buttonText: 'Avg',
    newOrder: 'average',
    newDirection: 'desc',
  },
  {
    originalOrder: 'text',
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
    const setState = mockFunction()
    const searchRecord: Record<string, string> = {
      ...defaultSearchParams,
      s_order: testCase.originalOrder,
      s_direction: testCase.originalDirection,
    }
    const { getByRole } = renderFromRecordWithSetState(searchRecord, setState)
    const button = getByRole('button', { name: testCase.buttonText })
    await user.click(button)
    const expected = {
      ...defaultSearchParams,
      s_order: testCase.newOrder,
      s_direction: testCase.newDirection,
    }
    assertDeepEqual(setState.mock.calls, [
      [
        {
          ...defaultSearchParams,
          s_order: testCase.originalOrder,
          s_direction: testCase.originalDirection,
        },
      ],
      [expected],
    ])
  })
})
