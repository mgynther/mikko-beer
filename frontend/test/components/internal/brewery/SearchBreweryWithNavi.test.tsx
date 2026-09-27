import { test } from '../../../test'
import { assertDeepEqual, assertDefined } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SearchBreweryWithNavi from '../../../../src/components/internal/brewery/SearchBreweryWithNavi'

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
  id: 'ecdc80a8-e634-4d96-98af-ebf08fe6bf4e',
  name: 'Coolhead',
  country: undefined,
}

const anotherBrewery = {
  id: 'f0fecf5b-a627-46e4-96c1-c9e327606f8f',
  name: 'Salama',
  country: undefined,
}

const breweries = [brewery, anotherBrewery]

test('selects brewery', async () => {
  const user = setupUser()
  const selector = mockFunction<[url: string], Promise<void>>(
    async () => undefined,
  )
  const searchBreweryIf: SearchBreweryIf = {
    useSearch: () => ({
      search: async () => breweries,
      isLoading: false,
    }),
    searchFieldIf: activeSearch,
  }
  const { getByRole } = render(
    <SearchBreweryWithNavi
      navigateIf={{
        useNavigate: () => selector,
      }}
      searchBreweryIf={searchBreweryIf}
    />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, 'Co')

  const itemOption = getByRole('option', { name: brewery.name })
  assertDefined(itemOption)
  await user.click(itemOption)
  assertDeepEqual(selector.mock.calls, [[`/breweries/${brewery.id}`]])
})
