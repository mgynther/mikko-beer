import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import CreateStorage from './CreateStorage'
import type { UseDebounce } from '../../core/types'
import type { CreateBeerIf, SearchBeerIf } from '../../core/beer/types'
import type { ReviewContainerIf } from '../../core/review/types'
import type { SearchIf } from '../../core/search/types'
import type { CreateStorageIf } from '../../core/storage/types'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false,
}

const beerId = '320ea456-b51a-408a-bf3f-9f69488fd551'
const beerName = 'Severin'
const beerSearchResult = {
  id: beerId,
  name: beerName,
  breweries: [
    {
      id: '95ba8194-8263-4f98-9cfc-5a26a07ecc10',
      name: 'Koskipanimo',
    },
  ],
  styles: [
    {
      id: 'c4e5b84d-c29b-404d-be96-94e2a6d496bb',
      name: 'american ipa',
    },
  ],
}
const beerSearchIf: SearchBeerIf = {
  useSearch: () => ({
    search: async () => [beerSearchResult],
    isLoading: false,
  }),
}
const dontCreateBeerIf: CreateBeerIf = {
  useCreate: () => dontCreate,
  editBeerIf: {
    selectBreweryIf: {
      create: {
        useCreate: () => dontCreate,
      },
      search: {
        useSearch: () => ({
          search: dontCall,
          isLoading: false,
        }),
      },
    },
    selectStyleIf: {
      create: {
        useCreate: () => ({
          ...dontCreate,
          createdStyle: undefined,
          hasError: false,
          isSuccess: false,
        }),
      },
      list: {
        useList: () => ({
          styles: undefined,
          isLoading: false,
        }),
      },
    },
  },
}

const containerId = 'b1afbf73-74be-46c7-967f-238975bba841'
const containerListResult = {
  id: containerId,
  type: 'bottle',
  size: '0.33',
}

const reviewContainerIf: ReviewContainerIf = {
  createIf: {
    useCreate: () => dontCreate,
  },
  listIf: {
    useList: () => ({
      data: {
        containers: [containerListResult],
      },
      isLoading: false,
    }),
  },
}

const searchIf: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

const dontCreateStorageIf: CreateStorageIf = {
  useCreate: () => ({
    create: dontCall,
    hasError: true,
    isLoading: false,
  }),
}

test('creates storage', async () => {
  const user = userEvent.setup()
  const create = vitest.fn()
  const {
    findByRole,
    getAllByRole,
    getByLabelText,
    getByPlaceholderText,
    getByRole,
  } = render(
    <CreateStorage
      searchIf={searchIf}
      selectBeerIf={{
        create: dontCreateBeerIf,
        search: beerSearchIf,
      }}
      createStorageIf={{
        useCreate: () => ({
          create,
          hasError: false,
          isLoading: false,
        }),
      }}
      reviewContainerIf={reviewContainerIf}
    />,
  )

  const selects = getAllByRole('radio', { name: 'Select' })
  await user.click(selects[0])
  const beerSearch = getByPlaceholderText('Search beer')
  expect(beerSearch).toBeDefined()
  beerSearch.focus()
  await user.paste('Seve')
  const beerButton = await findByRole('button', {
    name: 'Severin (Koskipanimo)',
  })
  expect(beerButton).toBeDefined()
  await user.click(beerButton)
  const containerSelect = getByRole('combobox')
  await user.click(containerSelect)
  const bottle = getByRole('option', { name: 'bottle 0.33' })
  await userEvent.selectOptions(containerSelect, bottle)

  const date = '2023-12-25'
  const dateInput = getByLabelText('Best before')
  fireEvent.change(dateInput, { target: { value: date } })

  const createButton = getByRole('button', { name: 'Create' })
  await user.click(createButton)

  expect(create.mock.calls).toEqual([
    [
      {
        beer: beerId,
        container: containerId,
        bestBefore: new Date(`${date}T12:00:00.000`).toISOString(),
      },
    ],
  ])
})

test('clears beer', async () => {
  const user = userEvent.setup()
  const { findByRole, getAllByRole, getByPlaceholderText, getByRole } = render(
    <CreateStorage
      searchIf={searchIf}
      selectBeerIf={{
        create: dontCreateBeerIf,
        search: beerSearchIf,
      }}
      createStorageIf={dontCreateStorageIf}
      reviewContainerIf={reviewContainerIf}
    />,
  )

  const selects = getAllByRole('radio', { name: 'Select' })
  await user.click(selects[0])
  const beerSearch = getByPlaceholderText('Search beer')
  expect(beerSearch).toBeDefined()
  beerSearch.focus()
  await user.paste('Seve')
  const beerButton = await findByRole('button', {
    name: 'Severin (Koskipanimo)',
  })
  expect(beerButton).toBeDefined()
  await user.click(beerButton)

  const changeButton = getByRole('button', { name: 'Change' })
  await user.click(changeButton)
  getByPlaceholderText('Name')
})

test('clears container', async () => {
  const user = userEvent.setup()
  const { getByRole } = render(
    <CreateStorage
      searchIf={searchIf}
      selectBeerIf={{
        create: dontCreateBeerIf,
        search: beerSearchIf,
      }}
      createStorageIf={dontCreateStorageIf}
      reviewContainerIf={reviewContainerIf}
    />,
  )

  const containerSelect = getByRole('combobox')
  await user.click(containerSelect)
  const bottle = getByRole('option', { name: 'bottle 0.33' })
  await userEvent.selectOptions(containerSelect, bottle)

  const changeButton = getByRole('button', { name: 'Change' })
  await user.click(changeButton)
  getByRole('combobox')
})

test('shows error', async () => {
  const { getByText } = render(
    <CreateStorage
      searchIf={searchIf}
      selectBeerIf={{
        create: dontCreateBeerIf,
        search: beerSearchIf,
      }}
      createStorageIf={dontCreateStorageIf}
      reviewContainerIf={reviewContainerIf}
    />,
  )

  getByText(/Creating failed. Please check data/)
})
