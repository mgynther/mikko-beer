import { test } from '../../../test'
import { assertDeepEqual, assertDefined } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SearchBrewery from '../../../../src/components/internal/brewery/SearchBrewery'

import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import type { UseDebounce } from '../../../../src/components/types/types'
import type { SearchBreweryIf } from '../../../../src/components/types/brewery/types'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const activeSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

const brewery = {
  id: '2825930f-bc30-4db0-9302-dd727bb9835c',
  name: 'Coolhead',
  country: undefined,
}

const anotherBrewery = {
  id: '0c50c605-dcf9-47d0-abdf-05c798810455',
  name: 'Salama',
  country: undefined,
}

const breweries = [brewery, anotherBrewery]

test('selects brewery', async () => {
  const user = setupUser()
  const selector = mockFunction()
  const searchBreweryIf: SearchBreweryIf = {
    useSearch: () => ({
      search: async () => breweries,
      isLoading: false,
    }),
    searchFieldIf: activeSearch,
  }
  const { getByRole } = render(
    <SearchBrewery searchBreweryIf={searchBreweryIf} select={selector} />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, 'Co')

  const itemOption = getByRole('option', { name: brewery.name })
  assertDefined(itemOption)
  await user.click(itemOption)
  assertDeepEqual(selector.mock.calls, [
    [{ id: brewery.id, name: brewery.name, country: undefined }],
  ])
})
