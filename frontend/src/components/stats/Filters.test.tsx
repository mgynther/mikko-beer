import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Filters from './Filters'
import { openFilters } from './filters-test-util'

const dontCall = (): any => {
  throw new Error('must not be called')
}

test('renders values when open', async () => {
  const user = userEvent.setup()
  const { getByRole, getByText } = render(
    <Filters
      filters={{
        minReviewCount: {
          value: 3,
          setValue: dontCall
        },
        maxReviewCount: {
          value: 13,
          setValue: dontCall
        },
        minReviewAverage: {
          value: 6.8,
          setValue: dontCall
        },
        maxReviewAverage: {
          value: 9.2,
          setValue: dontCall
        }
      }}
    />
  )
  await openFilters(getByRole, user)
  getByRole('button', { name: 'Filters ▲' })
  getByText('Minimum review count: 3')
  getByText('Maximum review count: 13')
  getByText('Minimum review average: 6.8')
  getByText('Maximum review average: 9.2')
})

test('sets minimum review count', async () => {
  const user = userEvent.setup()
  const setMinimumReviewCount = vitest.fn()
  const { getByDisplayValue, getByRole } = render(
    <Filters
      filters={{
        minReviewCount: {
          value: 3,
          setValue: setMinimumReviewCount
        },
        maxReviewCount: {
          value: 13,
          setValue: dontCall
        },
        minReviewAverage: {
          value: 6.8,
          setValue: dontCall
        },
        maxReviewAverage: {
          value: 9.2,
          setValue: dontCall
        }
      }}
    />
  )
  await openFilters(getByRole, user)
  const slider = getByDisplayValue('2')
  fireEvent.change(slider, {target: {value: '3'}})
  expect(setMinimumReviewCount.mock.calls).toEqual([[5]])
})

test('sets maximum review count', async () => {
  const user = userEvent.setup()
  const setMaximumReviewCount = vitest.fn()
  const { getByDisplayValue, getByRole } = render(
    <Filters
      filters={{
        minReviewCount: {
          value: 3,
          setValue: dontCall
        },
        maxReviewCount: {
          value: 13,
          setValue: setMaximumReviewCount
        },
        minReviewAverage: {
          value: 6.8,
          setValue: dontCall
        },
        maxReviewAverage: {
          value: 9.2,
          setValue: dontCall
        }
      }}
    />
  )
  await openFilters(getByRole, user)
  const slider = getByDisplayValue('5')
  fireEvent.change(slider, {target: {value: '6'}})
  expect(setMaximumReviewCount.mock.calls).toEqual([[21]])
})

test('sets minimum review average', async () => {
  const user = userEvent.setup()
  const setMinimumReviewAverage = vitest.fn()
  const { getByDisplayValue, getByRole } = render(
    <Filters
      filters={{
        minReviewCount: {
          value: 3,
          setValue: dontCall
        },
        maxReviewCount: {
          value: 13,
          setValue: dontCall
        },
        minReviewAverage: {
          value: 6.8,
          setValue: setMinimumReviewAverage
        },
        maxReviewAverage: {
          value: 9.2,
          setValue: dontCall
        }
      }}
    />
  )
  await openFilters(getByRole, user)
  const slider = getByDisplayValue('6.8')
  fireEvent.change(slider, {target: {value: '6.9'}})
  expect(setMinimumReviewAverage.mock.calls).toEqual([[6.9]])
})

test('sets maximum review average', async () => {
  const user = userEvent.setup()
  const setMaximumReviewAverage = vitest.fn()
  const { getByDisplayValue, getByRole } = render(
    <Filters
      filters={{
        minReviewCount: {
          value: 3,
          setValue: dontCall
        },
        maxReviewCount: {
          value: 13,
          setValue: dontCall
        },
        minReviewAverage: {
          value: 6.8,
          setValue: dontCall
        },
        maxReviewAverage: {
          value: 9.2,
          setValue: setMaximumReviewAverage
        }
      }}
    />
  )
  await openFilters(getByRole, user)
  const slider = getByDisplayValue('9.2')
  fireEvent.change(slider, {target: {value: '9.1'}})
  expect(setMaximumReviewAverage.mock.calls).toEqual([[9.1]])
})
