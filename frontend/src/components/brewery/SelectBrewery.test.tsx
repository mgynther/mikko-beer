import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SelectBrewery from './SelectBrewery'
import type { Brewery, SearchBreweryIf } from '../../core/brewery/types'
import type { UseDebounce } from '../../core/types'

const brewery: Brewery = {
  id: 'e8d6ca94-e17f-43a5-9ff4-3ac72349f33d',
  name: 'Koskipanimo'
}

const anotherBrewery: Brewery = {
  id: '4566c772-9de8-4edc-89fe-32c358b3dc23',
  name: 'Mallaskoski'
}

const search: SearchBreweryIf = {
  useSearch: () => ({
    search: async () => ([
      brewery,
      anotherBrewery
    ]),
    isLoading: false
  })
}

const useDebounce: UseDebounce = (str: string) => str

test('selects brewery', async () => {
  const user = userEvent.setup()
  const onSelect = vitest.fn()
  const { getByPlaceholderText, findByRole } = render(
    <SelectBrewery
      isRemoveVisible={false}
      remove={() => undefined}
      select={onSelect}
      selectBreweryIf={{
        create: {
          useCreate: () => {
            throw new Error('do not call')
          }
        },
        search
      }}
      searchIf={{
        useSearch: () => ({
          activate: () => undefined,
          isActive: true
        }),
        useDebounce
      }}
    />
  )
  const brewerySearch = getByPlaceholderText('Search brewery')
  await user.type(brewerySearch, 'Koskip')
  const breweryOption = await findByRole('button', { name: 'Koskipanimo' })
  await act(async () => { breweryOption.click(); })
  const selectCalls = onSelect.mock.calls
  expect(selectCalls).toEqual([[brewery]])
})

test('selects created brewery', async () => {
  const user = userEvent.setup()
  const onSelect = vitest.fn()
  const newBrewery: Brewery = {
    id: 'ca036383-f707-4a52-a26d-bd0c048c0106',
    name: 'Tuju'
  }
  const { getByPlaceholderText, getByRole, } = render(
    <SelectBrewery
      isRemoveVisible={false}
      remove={() => undefined}
      select={onSelect}
      selectBreweryIf={{
        create: {
          useCreate: () => ({
            create: async (): Promise<Brewery> => newBrewery,
            isLoading: false
          })
        },
        search
      }}
      searchIf={{
        useSearch: () => ({
          activate: () => undefined,
          isActive: false
        }),
        useDebounce
      }}
    />
  )
  const createRadio = getByRole('radio', { name: 'Create' })
  act(() => { createRadio.click(); })

  const createButton = getByRole('button', { name: 'Create' })
  const nameInput = getByPlaceholderText('Create brewery')
  await user.type(nameInput, newBrewery.name)
  await act(async() => { createButton.click(); })

  const selectCalls = onSelect.mock.calls
  expect(selectCalls).toEqual([[newBrewery]])
})
