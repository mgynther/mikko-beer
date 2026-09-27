import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { fireEvent } from '../../../fire-event'
import { setupUser } from '../../../user-event'
import { testTimes } from '../../filter-time'
import AllFilters from '../../../../src/components/internal/stats/AllFilters'
import { openFilters } from '../../open-filters'
import type { StatsFilters } from '../../../../src/components/internal/stats/filter-types'
import type { YearMonth } from '../../../../src/components/types/types'
import { dontCall } from '../../../dont-call'

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const defaultFilters: StatsFilters = {
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

test('opens filters', async () => {
  const user = setupUser()
  const setIsOpen = mockFunction<[isOpen: boolean]>()
  const { getByRole } = render(
    <AllFilters
      filterState={{
        filters: defaultFilters,
        isOpen: false,
        setIsOpen,
      }}
    />,
  )
  await openFilters(getByRole, user)
  assertDeepEqual(setIsOpen.mock.calls, [[true]])
})

test('closes filters', async () => {
  const user = setupUser()
  const setIsOpen = mockFunction<[isOpen: boolean]>()
  const { getByRole } = render(
    <AllFilters
      filterState={{
        filters: defaultFilters,
        isOpen: true,
        setIsOpen,
      }}
    />,
  )
  const toggleButton = getByRole('button', { name: 'Filters ▲' })
  await user.click(toggleButton)
  assertDeepEqual(setIsOpen.mock.calls, [[false]])
})

test('renders values when open', () => {
  const { getByRole, getByText } = render(
    <AllFilters
      filterState={{
        filters: {
          minReviewCount: {
            value: 3,
            setValue: dontCall,
          },
          maxReviewCount: {
            value: 13,
            setValue: dontCall,
          },
          minReviewAverage: {
            value: 6.8,
            setValue: dontCall,
          },
          maxReviewAverage: {
            value: 9.2,
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
        setIsOpen: () => undefined,
      }}
    />,
  )
  getByRole('button', { name: 'Filters ▲' })
  getByText('Minimum review count: 3')
  getByText('Maximum review count: 13')
  getByText('Minimum review average: 6.8')
  getByText('Maximum review average: 9.2')
  getByText(`Minimum time: ${testTimes.min.text}`)
  getByText(`Maximum time: ${testTimes.max.text}`)
})

test('sets minimum review count', () => {
  const setMinimumReviewCount = mockFunction<[value: number]>()
  const { getByDisplayValue } = render(
    <AllFilters
      filterState={{
        filters: {
          minReviewCount: {
            value: 3,
            setValue: setMinimumReviewCount,
          },
          maxReviewCount: {
            value: 13,
            setValue: dontCall,
          },
          minReviewAverage: {
            value: 6.8,
            setValue: dontCall,
          },
          maxReviewAverage: {
            value: 9.2,
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
        setIsOpen: () => undefined,
      }}
    />,
  )
  const slider = getByDisplayValue('2')
  fireEvent.change(slider, { target: { value: '3' } })
  assertDeepEqual(setMinimumReviewCount.mock.calls, [[5]])
})

test('sets maximum review count', () => {
  const setMaximumReviewCount = mockFunction<[value: number]>()
  const { getByDisplayValue } = render(
    <AllFilters
      filterState={{
        filters: {
          minReviewCount: {
            value: 3,
            setValue: dontCall,
          },
          maxReviewCount: {
            value: 13,
            setValue: setMaximumReviewCount,
          },
          minReviewAverage: {
            value: 6.8,
            setValue: dontCall,
          },
          maxReviewAverage: {
            value: 9.2,
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
        setIsOpen: () => undefined,
      }}
    />,
  )
  const slider = getByDisplayValue('5')
  fireEvent.change(slider, { target: { value: '6' } })
  assertDeepEqual(setMaximumReviewCount.mock.calls, [[21]])
})

test('sets minimum review average', () => {
  const setMinimumReviewAverage = mockFunction<[value: number]>()
  const { getByDisplayValue } = render(
    <AllFilters
      filterState={{
        filters: {
          minReviewCount: {
            value: 3,
            setValue: dontCall,
          },
          maxReviewCount: {
            value: 13,
            setValue: dontCall,
          },
          minReviewAverage: {
            value: 6.8,
            setValue: setMinimumReviewAverage,
          },
          maxReviewAverage: {
            value: 9.2,
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
        setIsOpen: () => undefined,
      }}
    />,
  )
  const slider = getByDisplayValue('6.8')
  fireEvent.change(slider, { target: { value: '6.9' } })
  assertDeepEqual(setMinimumReviewAverage.mock.calls, [[6.9]])
})

test('sets maximum review average', () => {
  const setMaximumReviewAverage = mockFunction<[value: number]>()
  const { getByDisplayValue } = render(
    <AllFilters
      filterState={{
        filters: {
          minReviewCount: {
            value: 3,
            setValue: dontCall,
          },
          maxReviewCount: {
            value: 13,
            setValue: dontCall,
          },
          minReviewAverage: {
            value: 6.8,
            setValue: dontCall,
          },
          maxReviewAverage: {
            value: 9.2,
            setValue: setMaximumReviewAverage,
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
        setIsOpen: () => undefined,
      }}
    />,
  )
  const slider = getByDisplayValue('9.2')
  fireEvent.change(slider, { target: { value: '9.1' } })
  assertDeepEqual(setMaximumReviewAverage.mock.calls, [[9.1]])
})

test('sets minimum time', () => {
  const setMinimumTime = mockFunction<[yearMonth: YearMonth]>()
  const { getByDisplayValue } = render(
    <AllFilters
      filterState={{
        filters: {
          minReviewCount: {
            value: 3,
            setValue: dontCall,
          },
          maxReviewCount: {
            value: 13,
            setValue: dontCall,
          },
          minReviewAverage: {
            value: 6.8,
            setValue: dontCall,
          },
          maxReviewAverage: {
            value: 9.2,
            setValue: dontCall,
          },
          timeStart: {
            min: minTime,
            max: maxTime,
            value: {
              year: 2018,
              month: 1,
            },
            setValue: setMinimumTime,
          },
          timeEnd: {
            min: minTime,
            max: maxTime,
            value: maxTime,
            setValue: dontCall,
          },
        },
        isOpen: true,
        setIsOpen: () => undefined,
      }}
    />,
  )
  const slider = getByDisplayValue('1')
  fireEvent.change(slider, { target: { value: '3' } })
  assertDeepEqual(setMinimumTime.mock.calls, [
    [
      {
        year: 2018,
        month: 3,
      },
    ],
  ])
})

test('sets maximum time', () => {
  const setMaximumTime = mockFunction<[yearMonth: YearMonth]>()
  const { getByDisplayValue } = render(
    <AllFilters
      filterState={{
        filters: {
          minReviewCount: {
            value: 3,
            setValue: dontCall,
          },
          maxReviewCount: {
            value: 13,
            setValue: dontCall,
          },
          minReviewAverage: {
            value: 6.8,
            setValue: dontCall,
          },
          maxReviewAverage: {
            value: 9.2,
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
            value: {
              year: 2018,
              month: 4,
            },
            setValue: setMaximumTime,
          },
        },
        isOpen: true,
        setIsOpen: () => undefined,
      }}
    />,
  )
  const slider = getByDisplayValue('4')
  fireEvent.change(slider, { target: { value: '5' } })
  assertDeepEqual(setMaximumTime.mock.calls, [
    [
      {
        year: 2018,
        month: 5,
      },
    ],
  ])
})
