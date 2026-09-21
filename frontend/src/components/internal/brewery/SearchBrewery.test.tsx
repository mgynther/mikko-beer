import { render } from '@testing-library/react'
import { setupUser } from '../../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'
import SearchBrewery from './SearchBrewery'

import type { SearchFieldIf } from '../../types/search/types'
import type { UseDebounce } from '../../types/types'
import type { SearchBreweryIf } from '../../types/brewery/types'

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
  const selector = vitest.fn()
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
  expect(input).toBeDefined()
  await user.type(input, 'Co')

  const itemOption = getByRole('option', { name: brewery.name })
  expect(itemOption).toBeDefined()
  await user.click(itemOption)
  expect(selector.mock.calls).toEqual([
    [{ id: brewery.id, name: brewery.name }],
  ])
})
