import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import AllFilters from './AllFilters'
import { openFilters } from './filters-test-util'
import type { StatsFilters, YearMonth } from '../../core/stats/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

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
  const user = userEvent.setup()
  const setIsOpen = vitest.fn()
  const { getByRole } = render(
    <AllFilters
      filters={defaultFilters}
      isOpen={false}
      setIsOpen={setIsOpen}
    />,
  )
  await openFilters(getByRole, user)
  expect(setIsOpen.mock.calls).toEqual([[true]])
})

test('closes filters', async () => {
  const user = userEvent.setup()
  const setIsOpen = vitest.fn()
  const { getByRole } = render(
    <AllFilters filters={defaultFilters} isOpen={true} setIsOpen={setIsOpen} />,
  )
  const toggleButton = getByRole('button', { name: 'Filters ▲' })
  await user.click(toggleButton)
  expect(setIsOpen.mock.calls).toEqual([[false]])
})

test('renders values when open', () => {
  const { getByRole, getByText } = render(
    <AllFilters
      filters={{
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
      }}
      isOpen={true}
      setIsOpen={() => undefined}
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
  const setMinimumReviewCount = vitest.fn()
  const { getByDisplayValue } = render(
    <AllFilters
      filters={{
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
      }}
      isOpen={true}
      setIsOpen={() => undefined}
    />,
  )
  const slider = getByDisplayValue('2')
  fireEvent.change(slider, { target: { value: '3' } })
  expect(setMinimumReviewCount.mock.calls).toEqual([[5]])
})

test('sets maximum review count', () => {
  const setMaximumReviewCount = vitest.fn()
  const { getByDisplayValue } = render(
    <AllFilters
      filters={{
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
      }}
      isOpen={true}
      setIsOpen={() => undefined}
    />,
  )
  const slider = getByDisplayValue('5')
  fireEvent.change(slider, { target: { value: '6' } })
  expect(setMaximumReviewCount.mock.calls).toEqual([[21]])
})

test('sets minimum review average', () => {
  const setMinimumReviewAverage = vitest.fn()
  const { getByDisplayValue } = render(
    <AllFilters
      filters={{
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
      }}
      isOpen={true}
      setIsOpen={() => undefined}
    />,
  )
  const slider = getByDisplayValue('6.8')
  fireEvent.change(slider, { target: { value: '6.9' } })
  expect(setMinimumReviewAverage.mock.calls).toEqual([[6.9]])
})

test('sets maximum review average', () => {
  const setMaximumReviewAverage = vitest.fn()
  const { getByDisplayValue } = render(
    <AllFilters
      filters={{
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
      }}
      isOpen={true}
      setIsOpen={() => undefined}
    />,
  )
  const slider = getByDisplayValue('9.2')
  fireEvent.change(slider, { target: { value: '9.1' } })
  expect(setMaximumReviewAverage.mock.calls).toEqual([[9.1]])
})

test('sets minimum time', () => {
  const setMinimumTime = vitest.fn()
  const { getByDisplayValue } = render(
    <AllFilters
      filters={{
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
      }}
      isOpen={true}
      setIsOpen={() => undefined}
    />,
  )
  const slider = getByDisplayValue('1')
  fireEvent.change(slider, { target: { value: '3' } })
  expect(setMinimumTime.mock.calls).toEqual([
    [
      {
        year: 2018,
        month: 3,
      },
    ],
  ])
})

test('sets maximum time', () => {
  const setMaximumTime = vitest.fn()
  const { getByDisplayValue } = render(
    <AllFilters
      filters={{
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
      }}
      isOpen={true}
      setIsOpen={() => undefined}
    />,
  )
  const slider = getByDisplayValue('4')
  fireEvent.change(slider, { target: { value: '5' } })
  expect(setMaximumTime.mock.calls).toEqual([
    [
      {
        year: 2018,
        month: 5,
      },
    ],
  ])
})
