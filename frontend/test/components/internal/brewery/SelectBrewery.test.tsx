import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SelectBrewery from '../../../../src/components/internal/brewery/SelectBrewery'
import type {
  Brewery,
  SearchBreweryIf,
} from '../../../../src/components/types/brewery/types'
import type { UseDebounce } from '../../../../src/components/types/types'
import { dontCall } from '../../../dont-call'

const brewery: Brewery = {
  id: 'e8d6ca94-e17f-43a5-9ff4-3ac72349f33d',
  name: 'Koskipanimo',
  country: undefined,
}

const anotherBrewery: Brewery = {
  id: '4566c772-9de8-4edc-89fe-32c358b3dc23',
  name: 'Mallaskoski',
  country: undefined,
}

const useDebounce: UseDebounce<string> = (str) => [str, false]

const getSearch: (isSearchFieldActive: boolean) => SearchBreweryIf = (
  isSearchFieldActive: boolean,
) => ({
  useSearch: () => ({
    search: async () => [brewery, anotherBrewery],
    isLoading: false,
  }),
  searchFieldIf: {
    useSearchField: () => ({
      activate: (): undefined => undefined,
      isActive: isSearchFieldActive,
    }),
    useDebounce,
  },
})

test('selects brewery', async () => {
  const user = setupUser()
  const onSelect = mockFunction()
  const { getByPlaceholderText, findByRole } = render(
    <SelectBrewery
      isRemoveVisible={false}
      remove={() => undefined}
      select={onSelect}
      selectBreweryIf={{
        create: {
          useCreate: dontCall,
        },
        search: getSearch(true),
      }}
    />,
  )
  const brewerySearch = getByPlaceholderText('Search brewery')
  await user.type(brewerySearch, 'Koskip')
  const breweryOption = await findByRole('option', { name: 'Koskipanimo' })
  await user.click(breweryOption)
  const selectCalls = onSelect.mock.calls
  assertDeepEqual(selectCalls, [[brewery]])
})

test('selects created brewery', async () => {
  const user = setupUser()
  const onSelect = mockFunction()
  const newBrewery: Brewery = {
    id: 'ca036383-f707-4a52-a26d-bd0c048c0106',
    name: 'Tuju',
    country: undefined,
  }
  const { getByPlaceholderText, getByRole } = render(
    <SelectBrewery
      isRemoveVisible={false}
      remove={() => undefined}
      select={onSelect}
      selectBreweryIf={{
        create: {
          useCreate: () => ({
            create: async (): Promise<Brewery> => newBrewery,
            isLoading: false,
          }),
        },
        search: getSearch(false),
      }}
    />,
  )
  const createRadio = getByRole('radio', { name: 'Create' })
  await user.click(createRadio)

  const createButton = getByRole('button', { name: 'Create' })
  const nameInput = getByPlaceholderText('Create brewery')
  await user.type(nameInput, newBrewery.name)
  await user.click(createButton)

  const selectCalls = onSelect.mock.calls
  assertDeepEqual(selectCalls, [[newBrewery]])
})
