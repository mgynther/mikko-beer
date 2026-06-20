import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Filters from './Filters'
import { openFilters } from '../common/filters-test-util'
import type { ReviewFilters } from './filter-types'
import { dontCall } from '../../../test-util/dont-call'

const defaultFilters: ReviewFilters = {
  minRating: {
    value: 1,
    setValue: dontCall,
  },
  maxRating: {
    value: Infinity,
    setValue: dontCall,
  },
  minTime: {
    min: {
      year: 2021,
      month: 12,
    },
    max: {
      year: 2023,
      month: 12,
    },
    value: {
      year: 2022,
      month: 6,
    },
    setValue: dontCall,
  },
  maxTime: {
    min: {
      year: 2021,
      month: 12,
    },
    max: {
      year: 2023,
      month: 12,
    },
    value: {
      year: 2022,
      month: 8,
    },
    setValue: dontCall,
  },
}

test('opens filters', async () => {
  const user = userEvent.setup()
  const setIsOpen = vitest.fn()
  const { getByRole } = render(
    <Filters
      filterState={{
        filters: defaultFilters,
        isOpen: false,
        setIsOpen: setIsOpen,
      }}
    />,
  )
  await openFilters(getByRole, user)
  expect(setIsOpen.mock.calls).toEqual([[true]])
})

test('closes filters', async () => {
  const user = userEvent.setup()
  const setIsOpen = vitest.fn()
  const { getByRole } = render(
    <Filters
      filterState={{
        filters: defaultFilters,
        isOpen: true,
        setIsOpen: setIsOpen,
      }}
    />,
  )
  const toggleButton = getByRole('button', { name: 'Filters ▲' })
  await user.click(toggleButton)
  expect(setIsOpen.mock.calls).toEqual([[false]])
})

test('renders values when open', () => {
  const { getByRole, getByText } = render(
    <Filters
      filterState={{
        filters: {
          minRating: {
            value: 5,
            setValue: dontCall,
          },
          maxRating: {
            value: 9,
            setValue: dontCall,
          },
          minTime: {
            min: {
              year: 2021,
              month: 12,
            },
            max: {
              year: 2023,
              month: 12,
            },
            value: {
              year: 2022,
              month: 4,
            },
            setValue: dontCall,
          },
          maxTime: {
            min: {
              year: 2021,
              month: 12,
            },
            max: {
              year: 2023,
              month: 12,
            },
            value: {
              year: 2022,
              month: 10,
            },
            setValue: dontCall,
          },
        },
        isOpen: true,
        setIsOpen: () => undefined,
      }}
    />,
  )
  getByRole('button', { name: 'Filters ▲' })
  getByText('Minimum rating: 5')
  getByText('Maximum rating: 9')
  getByText(`Minimum time: 2022-04`)
  getByText(`Maximum time: 2022-10`)
})

test('sets minimum rating', () => {
  const setMinimumRating = vitest.fn()
  const { getByDisplayValue } = render(
    <Filters
      filterState={{
        filters: {
          ...defaultFilters,
          minRating: {
            value: 5,
            setValue: setMinimumRating,
          },
        },
        isOpen: true,
        setIsOpen: () => undefined,
      }}
    />,
  )
  const slider = getByDisplayValue('5')
  fireEvent.change(slider, { target: { value: '6' } })
  expect(setMinimumRating.mock.calls).toEqual([[6]])
})

test('sets maximum rating', () => {
  const setMaximumRating = vitest.fn()
  const { getByDisplayValue } = render(
    <Filters
      filterState={{
        filters: {
          ...defaultFilters,
          minRating: {
            value: 9,
            setValue: setMaximumRating,
          },
        },
        isOpen: true,
        setIsOpen: () => undefined,
      }}
    />,
  )
  const slider = getByDisplayValue('9')
  fireEvent.change(slider, { target: { value: '8' } })
  expect(setMaximumRating.mock.calls).toEqual([[8]])
})

test('sets minimum time', () => {
  const setMinimumTime = vitest.fn()
  const { getByDisplayValue } = render(
    <Filters
      filterState={{
        filters: {
          ...defaultFilters,
          minTime: {
            ...defaultFilters.minTime,
            value: {
              year: 2022,
              month: 6,
            },
            setValue: setMinimumTime,
          },
        },
        isOpen: true,
        setIsOpen: () => undefined,
      }}
    />,
  )
  const slider = getByDisplayValue('6')
  fireEvent.change(slider, { target: { value: '3' } })
  expect(setMinimumTime.mock.calls).toEqual([
    [
      {
        year: 2022,
        month: 3,
      },
    ],
  ])
})

test('sets maximum time', () => {
  const setMaximumTime = vitest.fn()
  const { getByDisplayValue } = render(
    <Filters
      filterState={{
        filters: {
          ...defaultFilters,
          maxTime: {
            ...defaultFilters.maxTime,
            value: {
              year: 2022,
              month: 9,
            },
            setValue: setMaximumTime,
          },
        },
        isOpen: true,
        setIsOpen: () => undefined,
      }}
    />,
  )
  const slider = getByDisplayValue('9')
  fireEvent.change(slider, { target: { value: '8' } })
  expect(setMaximumTime.mock.calls).toEqual([
    [
      {
        year: 2022,
        month: 8,
      },
    ],
  ])
})
