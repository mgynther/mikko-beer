import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SelectBeer from './SelectBeer'
import type { CreateBeerRequest } from '../../core/beer/types'

const namePlaceholder = 'Name'

const useDebounce = (str: string): string => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const brewery = {
  id: 'a5a8968d-4556-4f66-8351-21f724cc8316',
  name: 'Koskipanimo'
}

const style = {
  id: '0344f996-1475-45b6-aa84-ac7e0da47c7c',
  name: 'IPA',
  parents: []
}

const beer = {
  id: '60b1745f-0d7e-48c2-a993-90f127dd81ff',
  name: 'Smörre',
  breweries: [brewery],
  styles: [style]
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const searchIf = {
  useSearch: () => ({
    activate: () => undefined,
      isActive: true
  }),
  useDebounce
}

test('selects created beer', async () => {
  const user = userEvent.setup()
  const selectBeer = vitest.fn()
  const id = 'b5a1c3e1-1dc2-4ef5-ba2d-01a7efb08be1'
  const { getByPlaceholderText, getByRole } = render(
    <SelectBeer
      select={selectBeer}
      selectBeerIf={{
        create: {
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
        },
        search: {
        useSearch: () => ({
          search: dontCall,
          isLoading: false
        })
        }
      }}
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

test('selects beer', async () => {
  const user = userEvent.setup()
  const selectBeer = vitest.fn()
  const { getAllByRole, getByRole } = render(
    <SelectBeer
      select={selectBeer}
      selectBeerIf={{
        create: {
          useCreate: () => ({
            create: dontCall,
            isLoading: false
          }),
          editBeerIf: {
            selectBreweryIf: {
              create: {
                useCreate: () => dontCreate
              },
              search: {
                useSearch: () => ({
                  search: dontCall,
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
                  styles: [],
                  isLoading: false
                })
              }
            }
          }
        },
        search: {
        useSearch: () => ({
          search: async () => [beer],
          isLoading: false
        })
        }
      }}
      searchIf={searchIf}
    />
  )

  const selectRadio = getAllByRole('radio', { name: 'Select' })[0]
  await user.click(selectRadio)

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Do')

  const itemButton = getByRole(
    'button',
    { name: `${beer.name} (${brewery.name})` }
  )
  expect(itemButton).toBeDefined()
  await user.click(itemButton)
  expect(selectBeer.mock.calls).toEqual([[ {
    breweries: [brewery.id],
    id: beer.id,
    name: beer.name,
    styles: [style.id]
  } ]])
})
