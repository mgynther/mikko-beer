import { act, fireEvent, render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Filters from './Filters'

const dontCall = (): any => {
  throw new Error('must not be called')
}

function open(
  getByRole: (type: string, props: Record<string, string>) => HTMLElement
): void {
  const toggleButton = getByRole('button', { name: 'Filters ▼' })
  act(() => { toggleButton.click(); })
}

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
    />
  )
  open(getByRole)
  getByRole('button', { name: 'Filters ▲' })
  getByText('Minimum review count: 3')
  getByText('Maximum review count: 13')
  getByText('Minimum review average: 6.8')
  getByText('Maximum review average: 9.2')
})

test('sets minimum review count', () => {
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
  open(getByRole)
  const slider = getByDisplayValue('2')
  fireEvent.change(slider, {target: {value: '3'}})
  expect(setMinimumReviewCount.mock.calls).toEqual([[5]])
})

test('sets maximum review count', () => {
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
  open(getByRole)
  const slider = getByDisplayValue('5')
  fireEvent.change(slider, {target: {value: '6'}})
  expect(setMaximumReviewCount.mock.calls).toEqual([[21]])
})

test('sets minimum review average', () => {
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
  open(getByRole)
  const slider = getByDisplayValue('6.8')
  fireEvent.change(slider, {target: {value: '6.9'}})
  expect(setMinimumReviewAverage.mock.calls).toEqual([[6.9]])
})

test('sets maximum review average', () => {
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
  open(getByRole)
  const slider = getByDisplayValue('9.2')
  fireEvent.change(slider, {target: {value: '9.1'}})
  expect(setMaximumReviewAverage.mock.calls).toEqual([[9.1]])
})
