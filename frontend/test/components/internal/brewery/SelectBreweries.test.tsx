import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SelectBreweries from '../../../../src/components/internal/brewery/SelectBreweries'
import type {
  Brewery,
  SearchBreweryIf,
} from '../../../../src/components/types/brewery/types'
import type { UseDebounce } from '../../../../src/components/types/types'
import { dontCall } from '../../../dont-call'

const brewery: Brewery = {
  id: '69ccb1b1-ee01-446d-b41f-58f57a14148f',
  name: 'Koskipanimo',
  country: undefined,
}

const anotherBrewery: Brewery = {
  id: 'a0bb0b55-c2d0-4150-9f18-8e3808cab0c3',
  name: 'Mallaskoski',
  country: undefined,
}

const useCreate = dontCall

const useDebounce: UseDebounce<string> = (str) => [str, false]

const getSearch: (mode: 'active' | 'inactive') => SearchBreweryIf = (
  mode: 'active' | 'inactive',
) => ({
  useSearch: () => ({
    search: async () => [anotherBrewery],
    isLoading: false,
  }),
  searchFieldIf: {
    useSearchField: () => ({
      activate: (): undefined => undefined,
      isActive: mode === 'active',
    }),
    useDebounce,
  },
})

test('selects one more brewery', async () => {
  const user = setupUser()
  const onSelect = mockFunction()
  const { findByRole, getByPlaceholderText, getByRole } = render(
    <SelectBreweries
      initialBreweries={[brewery]}
      select={onSelect}
      selectBreweryIf={{
        create: { useCreate },
        search: getSearch('active'),
      }}
    />,
  )

  const addButton = getByRole('button', { name: 'Add brewery' })
  await user.click(addButton)

  const brewerySearch = getByPlaceholderText('Search brewery')
  await user.type(brewerySearch, anotherBrewery.name)
  const breweryOption = await findByRole('option', {
    name: anotherBrewery.name,
  })
  await user.click(breweryOption)
  const selectCalls = onSelect.mock.calls
  assertDeepEqual(selectCalls, [[[]], [[]], [[brewery.id, anotherBrewery.id]]])
})

test('removes selected brewery', async () => {
  const user = setupUser()
  const onSelect = mockFunction()
  const { getAllByRole, getByRole } = render(
    <SelectBreweries
      initialBreweries={[brewery, anotherBrewery]}
      select={onSelect}
      selectBreweryIf={{
        create: { useCreate },
        search: getSearch('inactive'),
      }}
    />,
  )
  const changeButtons = getAllByRole('button', { name: 'Change' })
  await user.click(changeButtons[0])

  const selectCalls = onSelect.mock.calls
  assertDeepEqual(selectCalls, [[[]]])

  const removeButton = getByRole('button', { name: 'Remove' })
  await user.click(removeButton)

  const finalSelectedCalls = onSelect.mock.calls
  assertDeepEqual(finalSelectedCalls, [[[]], [[]], [[anotherBrewery.id]]])
})
