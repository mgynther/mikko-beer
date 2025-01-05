import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Filters from './Filters'
import { openFilters } from './filters-test-util'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const defaultFilters = {
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

test('opens filters', async () => {
  const user = userEvent.setup()
  const setIsOpen = vitest.fn()
  const { getByRole } = render(
    <Filters
      filters={defaultFilters}
      isOpen={false}
      setIsOpen={setIsOpen}
    />
  )
  await openFilters(getByRole, user)
  expect(setIsOpen.mock.calls).toEqual([[
    true
  ]])
})

test('closes filters', async () => {
  const user = userEvent.setup()
  const setIsOpen = vitest.fn()
  const { getByRole } = render(
    <Filters
      filters={defaultFilters}
      isOpen={true}
      setIsOpen={setIsOpen}
    />
  )
  const toggleButton = getByRole('button', { name: 'Filters ▲' })
  await user.click(toggleButton)
  expect(setIsOpen.mock.calls).toEqual([[
    false
  ]])
})

test('renders values when open', () => {
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
      isOpen={true}
      setIsOpen={() => undefined}
    />
  )
  getByRole('button', { name: 'Filters ▲' })
  getByText('Minimum review count: 3')
  getByText('Maximum review count: 13')
  getByText('Minimum review average: 6.8')
  getByText('Maximum review average: 9.2')
})

test('sets minimum review count', () => {
  const setMinimumReviewCount = vitest.fn()
  const { getByDisplayValue } = render(
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
      isOpen={true}
      setIsOpen={() => undefined}
    />
  )
  const slider = getByDisplayValue('2')
  fireEvent.change(slider, {target: {value: '3'}})
  expect(setMinimumReviewCount.mock.calls).toEqual([[5]])
})

test('sets maximum review count', () => {
  const setMaximumReviewCount = vitest.fn()
  const { getByDisplayValue } = render(
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
      isOpen={true}
      setIsOpen={() => undefined}
    />
  )
  const slider = getByDisplayValue('5')
  fireEvent.change(slider, {target: {value: '6'}})
  expect(setMaximumReviewCount.mock.calls).toEqual([[21]])
})

test('sets minimum review average', () => {
  const setMinimumReviewAverage = vitest.fn()
  const { getByDisplayValue } = render(
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
      isOpen={true}
      setIsOpen={() => undefined}
    />
  )
  const slider = getByDisplayValue('6.8')
  fireEvent.change(slider, {target: {value: '6.9'}})
  expect(setMinimumReviewAverage.mock.calls).toEqual([[6.9]])
})

test('sets maximum review average', () => {
  const setMaximumReviewAverage = vitest.fn()
  const { getByDisplayValue } = render(
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
      isOpen={true}
      setIsOpen={() => undefined}
    />
  )
  const slider = getByDisplayValue('9.2')
  fireEvent.change(slider, {target: {value: '9.1'}})
  expect(setMaximumReviewAverage.mock.calls).toEqual([[9.1]])
})
