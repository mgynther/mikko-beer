import { render } from '@testing-library/react'
import { setupUser } from '../../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'
import SearchBreweryWithNavi from './SearchBreweryWithNavi'

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
  const selector = vitest.fn()
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

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Co')

  const itemButton = getByRole('button', { name: brewery.name })
  expect(itemButton).toBeDefined()
  await user.click(itemButton)
  expect(selector.mock.calls).toEqual([[`/breweries/${brewery.id}`]])
})
