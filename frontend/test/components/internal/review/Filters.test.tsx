import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { fireEvent } from '../../../fire-event'
import { setupUser } from '../../../user-event'
import Filters from '../../../../src/components/internal/review/Filters'
import { openFilters } from '../../open-filters'
import type { ReviewFilters } from '../../../../src/components/internal/review/filter-types'
import { dontCall } from '../../../dont-call'

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
  const user = setupUser()
  const setIsOpen = mockFunction()
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
  assertDeepEqual(setIsOpen.mock.calls, [[true]])
})

test('closes filters', async () => {
  const user = setupUser()
  const setIsOpen = mockFunction()
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
  assertDeepEqual(setIsOpen.mock.calls, [[false]])
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
  const setMinimumRating = mockFunction()
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
  assertDeepEqual(setMinimumRating.mock.calls, [[6]])
})

test('sets maximum rating', () => {
  const setMaximumRating = mockFunction()
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
  assertDeepEqual(setMaximumRating.mock.calls, [[8]])
})

test('sets minimum time', () => {
  const setMinimumTime = mockFunction()
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
  assertDeepEqual(setMinimumTime.mock.calls, [
    [
      {
        year: 2022,
        month: 3,
      },
    ],
  ])
})

test('sets maximum time', () => {
  const setMaximumTime = mockFunction()
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
  assertDeepEqual(setMaximumTime.mock.calls, [
    [
      {
        year: 2022,
        month: 8,
      },
    ],
  ])
})
