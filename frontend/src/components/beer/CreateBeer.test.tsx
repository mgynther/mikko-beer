import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import CreateBeer from './CreateBeer'
import type { CreateBeerIf, CreateBeerRequest } from '../../core/beer/types'
import type { UseDebounce } from '../../core/types'
import type { SearchIf } from '../../core/search/types'

const id = 'dbec2360-d6af-45f4-b2a0-cad732a87e20'
const namePlaceholder = 'Name'

const useDebounce: UseDebounce<string> = str => [str, false]

const dontCall = (): any => {
  throw new Error('must not be called')
}

const brewery = {
  id: 'a1b6e983-40fb-40e2-b6ca-03c16c343e4c',
  name: 'Koskipanimo'
}

const style = {
  id: 'c514f531-a3d2-4a3f-80d0-9389211edca6',
  name: 'IPA',
  parents: []
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

test('creates beer', async () => {
  const user = userEvent.setup()
  const selectBeer = vitest.fn()
  const createBeerIf: CreateBeerIf = {
    useCreate: () => ({
      create: async (beer: CreateBeerRequest) => ({
        ...beer,
        id
      }),
      isLoading: false
    }),
    editBeerIf: {
      selectBreweryIf: {
        create: {
          useCreate: () => dontCreate
        },
        search: {
          useSearch: () => ({
            search: async () => [brewery],
              isLoading: false
          })
        }
      },
      selectStyleIf: {
        create: {
          useCreate: () => ({
            ...dontCreate,
            createdStyle: undefined,
            hasError: false,
            isSuccess: false
          })
        },
        list: {
          useList: () => ({
            styles: [style],
            isLoading: false
          })
        }
      }
    }
  }
  const searchIf: SearchIf = {
    useSearch: () => ({
      activate: () => undefined,
        isActive: true
    }),
    useDebounce
  }
  const { getByPlaceholderText, getByRole } = render(
    <CreateBeer
      select={selectBeer}
      createBeerIf={createBeerIf}
      searchIf={searchIf}
    />
  )
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'Severin')

  const brewerySearch = getByPlaceholderText('Search brewery')
  await user.type(brewerySearch, 'Koskipa')
  const breweryButton = getByRole('button', { name: 'Koskipanimo' })
  await user.click(breweryButton)

  const styleSearch = getByPlaceholderText('Search style')
  await user.type(styleSearch, 'IPA')
  const styleButton = getByRole('button', { name: 'IPA' })
  await user.click(styleButton)

  const createButton = getByRole('button', { name: 'Create beer' })
  expect(createButton.hasAttribute('disabled')).toEqual(false)
  await user.click(createButton)
  const createCalls = selectBeer.mock.calls
  expect(createCalls).toEqual([[{
    id,
    breweries: [brewery.id],
    name: 'Severin',
    styles: [style.id]
  }]])
})
