import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SearchLocationWithNavi from './SearchLocationWithNavi'

import type { SearchIf } from '../../core/search/types'
import type { UseDebounce } from '../../core/types'
import type { CreateLocationIf } from '../../core/location/types'

const useDebounce: UseDebounce = str => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const activeSearch: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}

const createLocationIf: CreateLocationIf = {
  useCreate: () => ({
    create: dontCall,
    isLoading: false
  })
}

const location = {
  id: '8c8bd0e8-1f40-443b-bfcb-3fe5d9f6d343',
  name: 'Oluthuone Kaisla'
}

const anotherLocation = {
  id: '0314d1fc-0892-4bbf-8c78-6bfc7dcbc734',
  name: 'St. Urho\'s Pub'
}

const locations = [
  location,
  anotherLocation
]

test('selects location', async () => {
  const user = userEvent.setup()
  const selector = vitest.fn()
  const { getByRole } = render(
    <SearchLocationWithNavi
      navigateIf={{
        useNavigate: () => selector
      }}
      searchLocationIf={{
        useSearch: () => ({
          search: async () => locations,
          isLoading: false
        }),
        create: createLocationIf
      }}
      searchIf={activeSearch}
    />
  )

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Oluth')

  const itemButton = getByRole('button', { name: location.name })
  expect(itemButton).toBeDefined()
  await user.click(itemButton)
  expect(selector.mock.calls).toEqual([[ `/locations/${location.id}` ]])
})

test('shows no results', async () => {
  const user = userEvent.setup()
  const selector = vitest.fn()
  const { getByRole, getByText } = render(
    <SearchLocationWithNavi
      navigateIf={{
        useNavigate: () => selector
      }}
      searchLocationIf={{
        useSearch: () => ({
          search: async () => [],
          isLoading: false
        }),
        create: createLocationIf
      }}
      searchIf={activeSearch}
    />
  )

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Oluth')

  getByText('No results')
})
