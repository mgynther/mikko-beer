import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SearchLocation from './SearchLocation'

import type { SearchIf } from '../../core/search/types'
import type { UseDebounce } from '../../core/types'
import type {
  CreateLocationIf,
  CreateLocationRequest
} from '../../core/location/types'

const useDebounce: UseDebounce = str => str

const placeholderText = 'Location'

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
      getConfirm={() => dontCall}
      isCreateEnabled={false}
      placeholderText={placeholderText}
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

test('does not show create button with case-insensitive match', async () => {
  const user = userEvent.setup()
  const selector = vitest.fn()
  const { getByRole, queryByRole } = render(
    <SearchLocation
      getConfirm={() => dontCall}
      isCreateEnabled={false}
      placeholderText={placeholderText}
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
  await user.type(input, location.name.toLowerCase())

  getByRole('button', { name: location.name })
  expect(
    queryByRole('button', { name: `Create "${location.name}"` })
  ).toEqual(null)
})

test('shows no results when creating not enabled', async () => {
  const user = userEvent.setup()
  const selector = vitest.fn()
  const { getByRole, getByText } = render(
    <SearchLocation
      getConfirm={() => dontCall}
      isCreateEnabled={false}
      placeholderText={placeholderText}
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
  const select = vitest.fn()
  const { getByRole } = render(
    <SearchLocation
      getConfirm={() => dontCall}
      isCreateEnabled={true}
      placeholderText={placeholderText}
      searchLocationIf={{
        useSearch: () => ({
          search: async () => [],
          isLoading: false
        }),
        create: {
          useCreate: () => ({
            create: async (locationRequest: CreateLocationRequest) => {
              create(locationRequest)
              return location
            },
            isLoading: false
          })
        }
      }}
      searchIf={activeSearch}
      select={select}
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
  expect(select.mock.calls).toEqual([[location]])
})

test('confirms creating location when partially matching result exists',
     async () => {
  const user = userEvent.setup()
  const create = vitest.fn()
  const select = vitest.fn()
  const confirmCb = vitest.fn()
  const { getByRole } = render(
    <SearchLocation
      getConfirm={() => (text: string) => {
        confirmCb(text)
        return true
      }}
      isCreateEnabled={true}
      placeholderText={placeholderText}
      searchLocationIf={{
        useSearch: () => ({
          search: async () => [{
            id: '28a00180-5f00-4aa3-bd12-8f56b03a2606',
            name: `${location.name}, Tampere`
          }],
          isLoading: false
        }),
        create: {
          useCreate: () => ({
            create: async (locationRequest: CreateLocationRequest) => {
              create(locationRequest)
              return location
            },
            isLoading: false
          })
        }
      }}
      searchIf={activeSearch}
      select={select}
    />
  )

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, location.name)

  const createButton =
    getByRole('button', { name: `Create "${location.name}"` })
  expect(createButton).toBeDefined()
  await user.click(createButton)
  expect(confirmCb.mock.calls).toEqual([[
    `Are you sure you want to create ${location.name}?`
  ]])
  expect(create.mock.calls).toEqual([[
    { name: location.name }
  ]])
  expect(select.mock.calls).toEqual([[location]])
})

test('sorts existing result before create new location', async () => {
  const user = userEvent.setup()
  const resultName = `${location.name}, Tampere`
  const { getAllByRole, getByRole } = render(
    <SearchLocation
      getConfirm={() => dontCall}
      isCreateEnabled={true}
      placeholderText={placeholderText}
      searchLocationIf={{
        useSearch: () => ({
          search: async () => [{
            id: '0c6d96c9-7404-40f7-98b6-2400f8c29743',
            name: resultName
          }],
          isLoading: false
        }),
        create: {
          useCreate: () => ({
            create: dontCall,
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

  const resultButtons = getAllByRole('button', { name: /Huurre/ })
  expect(resultButtons.map(item => item.innerHTML)).toEqual([
    resultName,
    `Create "${location.name}"`
  ])
})
