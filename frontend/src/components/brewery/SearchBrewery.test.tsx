import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SearchBrewery from './SearchBrewery'

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
  id: '2825930f-bc30-4db0-9302-dd727bb9835c',
  name: 'Coolhead'
}

const anotherBrewery = {
  id: '0c50c605-dcf9-47d0-abdf-05c798810455',
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
    <SearchBrewery
      searchBreweryIf={{
        useSearch: () => ({
          search: async () => breweries,
          isLoading: false
        })
      }}
      searchIf={activeSearch}
      select={selector}
    />
  )

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Co')

  const itemButton = getByRole('button', { name: brewery.name })
  expect(itemButton).toBeDefined()
  await user.click(itemButton)
  expect(selector.mock.calls).toEqual([[ { id: brewery.id, name: brewery.name } ]])
})
