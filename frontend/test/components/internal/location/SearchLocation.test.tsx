import { test } from '../../../test'
import { assertDeepEqual, assertDefined } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SearchLocation from '../../../../src/components/internal/location/SearchLocation'

import type { Location } from '../../../../src/components/types/location/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import type { UseDebounce } from '../../../../src/components/types/types'
import type {
  CreateLocationIf,
  CreateLocationRequest,
} from '../../../../src/components/types/location/types'
import { dontCall } from '../../../dont-call'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const placeholderText = 'Location'

const activeSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

const dontCreateLocation: CreateLocationIf = {
  useCreate: () => ({
    create: dontCall,
    isLoading: false,
  }),
}

const location = {
  id: '9709c048-9780-4b18-8960-774436dea84b',
  name: 'Public House Huurre',
}

const anotherLocation = {
  id: '5db40337-e4f7-467a-9273-509f57c499ba',
  name: 'Huurupiilo',
}

const locations: Location[] = [location, anotherLocation]

test('selects location', async () => {
  const user = setupUser()
  const selector = mockFunction()
  const { getByRole } = render(
    <SearchLocation
      confirm={dontCall}
      isCreateEnabled={false}
      placeholderText={placeholderText}
      searchLocationIf={{
        useSearch: () => ({
          search: async (): Promise<Location[]> => locations,
          isLoading: false,
        }),
        create: dontCreateLocation,
        searchFieldIf: activeSearch,
      }}
      select={selector}
    />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, 'Public H')

  const itemOption = getByRole('option', { name: location.name })
  assertDefined(itemOption)
  await user.click(itemOption)
  assertDeepEqual(selector.mock.calls, [
    [{ id: location.id, name: location.name }],
  ])
})

test('does not show create button with case-insensitive match', async () => {
  const user = setupUser()
  const selector = mockFunction()
  const { getByRole, queryByRole } = render(
    <SearchLocation
      confirm={dontCall}
      isCreateEnabled={false}
      placeholderText={placeholderText}
      searchLocationIf={{
        useSearch: () => ({
          search: async (): Promise<Location[]> => locations,
          isLoading: false,
        }),
        create: dontCreateLocation,
        searchFieldIf: activeSearch,
      }}
      select={selector}
    />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, location.name.toLowerCase())

  getByRole('option', { name: location.name })
  assertDeepEqual(
    queryByRole('button', { name: `Create "${location.name}"` }),
    null,
  )
})

test('shows no results when creating not enabled', async () => {
  const user = setupUser()
  const selector = mockFunction()
  const { getByRole, getByText } = render(
    <SearchLocation
      confirm={dontCall}
      isCreateEnabled={false}
      placeholderText={placeholderText}
      searchLocationIf={{
        useSearch: () => ({
          search: async (): Promise<Location[]> => [],
          isLoading: false,
        }),
        create: dontCreateLocation,
        searchFieldIf: activeSearch,
      }}
      select={selector}
    />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, 'Public H')

  getByText('No results')
})

test('creates location', async () => {
  const user = setupUser()
  const create = mockFunction()
  const select = mockFunction()
  const { getByRole } = render(
    <SearchLocation
      confirm={dontCall}
      isCreateEnabled={true}
      placeholderText={placeholderText}
      searchLocationIf={{
        useSearch: () => ({
          search: async (): Promise<Location[]> => [],
          isLoading: false,
        }),
        create: {
          useCreate: () => ({
            create: async (
              locationRequest: CreateLocationRequest,
            ): Promise<Location> => {
              create(locationRequest)
              return location
            },
            isLoading: false,
          }),
        },
        searchFieldIf: activeSearch,
      }}
      select={select}
    />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, location.name)

  const createOption = getByRole('option', {
    name: `Create "${location.name}"`,
  })
  assertDefined(createOption)
  await user.click(createOption)
  assertDeepEqual(create.mock.calls, [[{ name: location.name }]])
  assertDeepEqual(select.mock.calls, [[location]])
})

test('confirms creating location with partially matching result', async () => {
  const user = setupUser()
  const create = mockFunction()
  const select = mockFunction()
  const confirmCb = mockFunction()
  const { getByRole } = render(
    <SearchLocation
      confirm={(text: string): boolean => {
        confirmCb(text)
        return true
      }}
      isCreateEnabled={true}
      placeholderText={placeholderText}
      searchLocationIf={{
        useSearch: () => ({
          search: async (): Promise<Location[]> => [
            {
              id: '28a00180-5f00-4aa3-bd12-8f56b03a2606',
              name: `${location.name}, Tampere`,
            },
          ],
          isLoading: false,
        }),
        create: {
          useCreate: () => ({
            create: async (
              locationRequest: CreateLocationRequest,
            ): Promise<Location> => {
              create(locationRequest)
              return location
            },
            isLoading: false,
          }),
        },
        searchFieldIf: activeSearch,
      }}
      select={select}
    />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, location.name)

  const createOption = getByRole('option', {
    name: `Create "${location.name}"`,
  })
  assertDefined(createOption)
  await user.click(createOption)
  assertDeepEqual(confirmCb.mock.calls, [
    [`Are you sure you want to create ${location.name}?`],
  ])
  assertDeepEqual(create.mock.calls, [[{ name: location.name }]])
  assertDeepEqual(select.mock.calls, [[location]])
})

test('does not create location on reject', async () => {
  const user = setupUser()
  const create = mockFunction()
  const select = mockFunction()
  const confirmCb = mockFunction()
  const { getByRole } = render(
    <SearchLocation
      confirm={(text: string): boolean => {
        confirmCb(text)
        return false
      }}
      isCreateEnabled={true}
      placeholderText={placeholderText}
      searchLocationIf={{
        useSearch: () => ({
          search: async (): Promise<Location[]> => [
            {
              id: '18047635-1cd9-4c5e-b5fd-379f58d80f6d',
              name: `${location.name}, Tampere`,
            },
          ],
          isLoading: false,
        }),
        create: {
          useCreate: () => ({
            create: dontCall,
            isLoading: false,
          }),
        },
        searchFieldIf: activeSearch,
      }}
      select={select}
    />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, location.name)

  const createOption = getByRole('option', {
    name: `Create "${location.name}"`,
  })
  assertDefined(createOption)
  await user.click(createOption)
  assertDeepEqual(confirmCb.mock.calls, [
    [`Are you sure you want to create ${location.name}?`],
  ])
  assertDeepEqual(create.mock.calls, [])
  assertDeepEqual(select.mock.calls, [])
})

test('sorts existing result before create new location', async () => {
  const user = setupUser()
  const resultName = `${location.name}, Tampere`
  const { getAllByRole, getByRole } = render(
    <SearchLocation
      confirm={dontCall}
      isCreateEnabled={true}
      placeholderText={placeholderText}
      searchLocationIf={{
        useSearch: () => ({
          search: async (): Promise<Location[]> => [
            {
              id: '0c6d96c9-7404-40f7-98b6-2400f8c29743',
              name: resultName,
            },
          ],
          isLoading: false,
        }),
        create: {
          useCreate: () => ({
            create: dontCall,
            isLoading: false,
          }),
        },
        searchFieldIf: activeSearch,
      }}
      select={dontCall}
    />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, location.name)

  const resultOptions = getAllByRole('option', { name: /Huurre/v })
  assertDeepEqual(
    resultOptions.map((item) => item.innerHTML),
    [resultName, `Create "${location.name}"`],
  )
})
