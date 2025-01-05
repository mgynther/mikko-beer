import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Container from './Container'
import type {
  BreweryStyleParams,
  OneContainerStats
} from '../../core/stats/types'
import { openFilters } from './filters-test-util'
import type { SearchParameters } from '../util'

const breweryId = 'e6887360-78da-49e2-b876-68477c79c776'
const styleId = '2b885977-a2fd-43c2-95f9-6b19f3c8054d'

const containerStats: OneContainerStats[] = [
  {
    containerId: 'f6937cf3-e0fa-4c6b-92b5-f374242342f6',
    containerSize: '0.25',
    containerType: 'draft',
    reviewAverage: '7.87',
    reviewCount: '24'
  },
  {
    containerId: 'f908dc6a-3ed7-49e1-8caf-6ae1b9aac4ff',
    containerSize: '0.33',
    containerType: 'bottle',
    reviewAverage: '8.23',
    reviewCount: '10'
  }
]

const defaultSearchParams: Record<string, string> = {
  filters_open: '0',
  sorting_order: 'text',
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

function toSearchParams (record: Record<string, string>): SearchParameters {
  return {
    get: (name: string) => record[name]
  }
}

function getDefaultSearchParameters (): SearchParameters {
  return {
    get: (name: string) => defaultSearchParams[name]
  }
}

function renderContainer (
  stats: ReturnType<typeof vitest.fn>,
  setState: ReturnType<typeof vitest.fn>,
  searchParams: SearchParameters
): ReturnType<typeof render> {
  return render(
    <Container
      getContainerStatsIf={{
        useStats: (params: BreweryStyleParams) => {
          stats(params)
          return {
            stats: {
              container: containerStats
            },
            isLoading: false
          }
        }
      }}
      breweryId={breweryId}
      search={searchParams}
      setState={setState}
      styleId={styleId}
    />
  )
}

function renderWithStats (
  stats: ReturnType<typeof vitest.fn>
): ReturnType<typeof render> {
  return renderContainer(stats, vitest.fn(), getDefaultSearchParameters())
}

function renderFromRecord (
  record: Record<string, string>
): ReturnType<typeof render> {
  return renderContainer(vitest.fn(), vitest.fn(), toSearchParams(record))
}

function renderFromRecordWithSetState (
  record: Record<string, string>,
  setState: ReturnType<typeof vitest.fn>
): ReturnType<typeof render> {
  return renderContainer(vitest.fn(), setState, toSearchParams(record))
}

test('renders container stats', () => {
  const stats = vitest.fn()
  const { getByText } = renderWithStats(stats)
  expect(stats.mock.calls).toEqual([[{ breweryId, styleId }]])
  getByText('7.87')
  getByText('10')
  getByText('draft 0.25')
  getByText('8.23')
  getByText('24')
  getByText('bottle 0.33')
})

test('filter container stats by min average', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    min_review_average: '8.10'
  }
  const { getByText, queryByText } = renderFromRecord(searchRecord)
  expect(queryByText('7.87')).toEqual(null)
  getByText('8.23')
})

test('filter container stats by max average', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    max_review_average: '8.00'
  }
  const { getByText, queryByText } = renderFromRecord(searchRecord)
  getByText('7.87')
  expect(queryByText('8.23')).toEqual(null)
})

test('filter container stats by min count', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    min_review_count: '13'
  }
  const { getByText, queryByText } = renderFromRecord(searchRecord)
  expect(queryByText('10')).toEqual(null)
  getByText('24')
})

test('filter container stats by max count', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    max_review_count: '13'
  }
  const { getByText, queryByText } = renderFromRecord(searchRecord)
  getByText('10')
  expect(queryByText('24')).toEqual(null)
})

test('order container stats by average desc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    sorting_order: 'average',
    list_direction: 'desc'
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const averages = getAllByText(/7.87|8.23/)
  expect(averages.length).toEqual(2)
  expect(averages[0].innerHTML).toEqual('8.23')
  expect(averages[1].innerHTML).toEqual('7.87')
})

test('order container stats by average asc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    sorting_order: 'average',
    list_direction: 'asc'
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const averages = getAllByText(/7.87|8.23/)
  expect(averages.length).toEqual(2)
  expect(averages[0].innerHTML).toEqual('7.87')
  expect(averages[1].innerHTML).toEqual('8.23')
})

test('order container stats by count desc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    sorting_order: 'count',
    list_direction: 'desc'
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const counts = getAllByText(/10|24/)
  expect(counts.length).toEqual(2)
  expect(counts[0].innerHTML).toEqual('24')
  expect(counts[1].innerHTML).toEqual('10')
})

test('order container stats by count asc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    sorting_order: 'count',
    list_direction: 'asc'
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const counts = getAllByText(/10|24/)
  expect(counts.length).toEqual(2)
  expect(counts[0].innerHTML).toEqual('10')
  expect(counts[1].innerHTML).toEqual('24')
})

test('order container stats by container desc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    sorting_order: 'text',
    list_direction: 'desc'
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const containers = getAllByText(/draft 0.25|bottle 0.33/)
  expect(containers.length).toEqual(2)
  expect(containers[0].innerHTML).toEqual('draft 0.25')
  expect(containers[1].innerHTML).toEqual('bottle 0.33')
})

test('order container stats by container asc', () => {
  const searchRecord: Record<string, string> = {
    ...defaultSearchParams,
    sorting_order: 'text',
    list_direction: 'asc'
  }
  const { getAllByText } = renderFromRecord(searchRecord)
  const containers = getAllByText(/draft 0.25|bottle 0.33/)
  expect(containers.length).toEqual(2)
  expect(containers[0].innerHTML).toEqual('bottle 0.33')
  expect(containers[1].innerHTML).toEqual('draft 0.25')
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
  test(`change ${testCase.property}`, () => {
    const setState = vitest.fn()
    const { getByDisplayValue } =
      renderFromRecordWithSetState(defaultFiltersOpenParams, setState)
    changeSlider(
      getByDisplayValue,
      testCase.fromDisplayValue,
      testCase.toDisplayValue
    )
    const expected = {
      ...defaultFiltersOpenParams,
    }
    expected[testCase.property] = testCase.stateValue
    expect(setState.mock.calls).toEqual([[expected]])
  })
})

test('opens filters', async () => {
  const user = userEvent.setup()
  const setState = vitest.fn()
  const { getByRole } =
    renderFromRecordWithSetState(defaultSearchParams, setState)
  await openFilters(getByRole, user)
  expect(setState.mock.calls).toEqual([[{
    ...defaultSearchParams,
    filters_open: '1'
  }]])
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
    newDirection: 'desc'
  },
  {
    originalOrder: 'text',
    originalDirection: 'desc',
    buttonText: 'Container ▼',
    newOrder: 'text',
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
    buttonText: 'Container',
    newOrder: 'text',
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
    originalOrder: 'text',
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
    const { getByRole } = renderFromRecordWithSetState(searchRecord, setState)
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
