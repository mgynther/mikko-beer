import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SearchLocation from './SearchLocation'

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

const dontCreateLocation: CreateLocationIf = {
  useCreate: () => ({
    create: dontCall,
    isLoading: false
  })
}

const location = {
  id: '9709c048-9780-4b18-8960-774436dea84b',
  name: 'Public House Huurre'
}

const anotherLocation = {
  id: '5db40337-e4f7-467a-9273-509f57c499ba',
  name: 'Huurupiilo'
}

const locations = [
  location,
  anotherLocation
]

test('selects location', async () => {
  const user = userEvent.setup()
  const selector = vitest.fn()
  const { getByRole } = render(
    <SearchLocation
      isCreateEnabled={false}
      searchLocationIf={{
        useSearch: () => ({
          search: async () => locations,
          isLoading: false
        }),
        create: dontCreateLocation
      }}
      searchIf={activeSearch}
      select={selector}
    />
  )

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Public H')

  const itemButton = getByRole('button', { name: location.name })
  expect(itemButton).toBeDefined()
  await user.click(itemButton)
  expect(selector.mock.calls).toEqual([[
    { id: location.id, name: location.name }
  ]])
})

test('shows no results when creating not enabled', async () => {
  const user = userEvent.setup()
  const selector = vitest.fn()
  const { getByRole, getByText } = render(
    <SearchLocation
      isCreateEnabled={false}
      searchLocationIf={{
        useSearch: () => ({
          search: async () => [],
          isLoading: false
        }),
        create: dontCreateLocation
      }}
      searchIf={activeSearch}
      select={selector}
    />
  )

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Public H')

  getByText('No results')
})

test('creates location', async () => {
  const user = userEvent.setup()
  const create = vitest.fn()
  const { getByRole } = render(
    <SearchLocation
      isCreateEnabled={true}
      searchLocationIf={{
        useSearch: () => ({
          search: async () => [],
          isLoading: false
        }),
        create: {
          useCreate: () => ({
            create,
            isLoading: false
          })
        }
      }}
      searchIf={activeSearch}
      select={dontCall}
    />
  )

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, location.name)

  const createButton =
    getByRole('button', { name: `Create "${location.name}"` })
  expect(createButton).toBeDefined()
  await user.click(createButton)
  expect(create.mock.calls).toEqual([[
    { name: location.name }
  ]])
})
