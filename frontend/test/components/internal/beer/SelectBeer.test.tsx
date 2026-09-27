import { test } from '../../../test'
import { assertDeepEqual, assertDefined, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SelectBeer from '../../../../src/components/internal/beer/SelectBeer'
import type {
  Beer,
  BeerWithIds,
  CreateBeerRequest,
} from '../../../../src/components/types/beer/types'
import type { UseDebounce } from '../../../../src/components/types/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import type { Brewery } from '../../../../src/components/types/brewery/types'
import { dontCall } from '../../../dont-call'

const namePlaceholder = 'Name'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const brewery = {
  id: 'a5a8968d-4556-4f66-8351-21f724cc8316',
  name: 'Koskipanimo',
  country: undefined,
}

const style = {
  id: '0344f996-1475-45b6-aa84-ac7e0da47c7c',
  name: 'IPA',
  parents: [],
}

const beer = {
  id: '60b1745f-0d7e-48c2-a993-90f127dd81ff',
  name: 'Smörre',
  breweries: [brewery],
  styles: [style],
}

const dontCreate = {
  create: dontCall,
  isLoading: false,
}

const searchFieldIf: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

test('selects created beer', async () => {
  const user = setupUser()
  const selectBeer = mockFunction()
  const id = 'b5a1c3e1-1dc2-4ef5-ba2d-01a7efb08be1'
  const { getByPlaceholderText, getByRole } = render(
    <SelectBeer
      select={selectBeer}
      selectBeerIf={{
        create: {
          useCreate: () => ({
            create: async (beer: CreateBeerRequest): Promise<BeerWithIds> => ({
              ...beer,
              id,
            }),
            isLoading: false,
          }),
          editBeerIf: {
            selectBreweryIf: {
              create: {
                useCreate: () => dontCreate,
              },
              search: {
                useSearch: () => ({
                  search: async (): Promise<Brewery[]> => [brewery],
                  isLoading: false,
                }),
                searchFieldIf,
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
                  styles: [style],
                  isLoading: false,
                }),
                searchFieldIf,
              },
            },
          },
        },
        search: {
          useSearch: () => ({
            search: dontCall,
            isLoading: false,
          }),
          searchFieldIf: {
            useSearchField: dontCall,
            useDebounce: dontCall,
          },
        },
      }}
    />,
  )
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'Severin')

  const brewerySearch = getByPlaceholderText('Search brewery')
  await user.type(brewerySearch, 'Koskipa')
  const breweryOption = getByRole('option', { name: 'Koskipanimo' })
  await user.click(breweryOption)

  const styleSearch = getByPlaceholderText('Search style')
  await user.type(styleSearch, 'IPA')
  const styleOption = getByRole('option', { name: 'IPA' })
  await user.click(styleOption)

  const createButton = getByRole('button', { name: 'Create beer' })
  assertEqual(createButton.hasAttribute('disabled'), false)
  await user.click(createButton)
  const createCalls = selectBeer.mock.calls
  assertDeepEqual(createCalls, [
    [
      {
        id,
        breweries: [brewery.id],
        name: 'Severin',
        styles: [style.id],
      },
    ],
  ])
})

test('selects beer', async () => {
  const user = setupUser()
  const selectBeer = mockFunction()
  const { getAllByRole, getByRole } = render(
    <SelectBeer
      select={selectBeer}
      selectBeerIf={{
        create: {
          useCreate: () => ({
            create: dontCall,
            isLoading: false,
          }),
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
                searchFieldIf,
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
                  styles: [],
                  isLoading: false,
                }),
                searchFieldIf,
              },
            },
          },
        },
        search: {
          useSearch: () => ({
            search: async (): Promise<Beer[]> => [beer],
            isLoading: false,
          }),
          searchFieldIf,
        },
      }}
    />,
  )

  const selectRadio = getAllByRole('radio', { name: 'Select' })[0]
  await user.click(selectRadio)

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, 'Do')

  const itemOption = getByRole('option', {
    name: `${beer.name} (${brewery.name})`,
  })
  assertDefined(itemOption)
  await user.click(itemOption)
  assertDeepEqual(selectBeer.mock.calls, [
    [
      {
        breweries: [brewery.id],
        id: beer.id,
        name: beer.name,
        styles: [style.id],
      },
    ],
  ])
})
