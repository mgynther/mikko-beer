import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SearchBreweryWithNavi from './SearchBreweryWithNavi'

import type { SearchIf } from '../../core/search/types'

const useDebounce = (str: string) => str

const activeSearch: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}

const brewery = {
  id: 'ecdc80a8-e634-4d96-98af-ebf08fe6bf4e',
  name: 'Coolhead'
}

const anotherBrewery = {
  id: 'f0fecf5b-a627-46e4-96c1-c9e327606f8f',
  name: 'Salama'
}

const breweries = [
  brewery,
  anotherBrewery
]

test('selects brewery', async () => {
  const user = userEvent.setup()
  const selector = vitest.fn()
  const { getByRole } = render(
    <SearchBreweryWithNavi
      navigateIf={{
        useNavigate: () => selector
      }}
      searchBreweryIf={{
        useSearch: () => ({
          search: async () => breweries,
          isLoading: false
        })
      }}
      searchIf={activeSearch}
    />
  )

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Co')

  const itemButton = getByRole('button', { name: brewery.name })
  expect(itemButton).toBeDefined()
  await user.click(itemButton)
  expect(selector.mock.calls).toEqual([[ `/breweries/${brewery.id}` ]])
})
