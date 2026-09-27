import { test } from '../../../test'
import { assertDeepEqual, assertDefined } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SearchBeer from '../../../../src/components/internal/beer/SearchBeer'

import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import type { UseDebounce } from '../../../../src/components/types/types'
import type { SearchBeerIf } from '../../../../src/components/types/beer/types'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const activeSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

const brewery = {
  id: 'a3fe0c43-e1be-4f28-b091-d53746044895',
  name: 'Lehe Pruulikoda',
}

const breweries = [brewery]

const styles = [
  {
    id: '15de46da-d720-4c27-bd94-9c04291cceed',
    name: 'Sour',
  },
]

const beer = {
  id: '91e91e26-2fa2-45ea-bda3-d66674bf8f1a',
  name: 'Doomino efekt',
  breweries,
  styles,
}

const anotherBeer = {
  id: 'd18e490c-dfbc-4256-a272-64e54e6aa6f2',
  name: 'Incubus',
  breweries,
  styles,
}

const beers = [beer, anotherBeer]

test('selects beer', async () => {
  const user = setupUser()
  const selector = mockFunction()
  const searchBeerIf: SearchBeerIf = {
    useSearch: () => ({
      search: async () => beers,
      isLoading: false,
    }),
    searchFieldIf: activeSearch,
  }
  const { getByRole } = render(
    <SearchBeer searchBeerIf={searchBeerIf} select={selector} />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, 'Do')

  const itemOption = getByRole('option', {
    name: `${beer.name} (${brewery.name})`,
  })
  assertDefined(itemOption)
  await user.click(itemOption)
  assertDeepEqual(selector.mock.calls, [
    [
      {
        breweries: breweries.map((b) => b.id),
        id: beer.id,
        name: beer.name,
        styles: styles.map((b) => b.id),
      },
    ],
  ])
})
