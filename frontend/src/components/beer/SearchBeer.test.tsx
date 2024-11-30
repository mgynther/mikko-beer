import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SearchBeer from './SearchBeer'

import type { SearchIf } from '../../core/search/types'
import type { UseDebounce } from '../../core/types'

const useDebounce: UseDebounce = (str: string) => str

const activeSearch: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}

const brewery = {
  id: 'a3fe0c43-e1be-4f28-b091-d53746044895',
  name: 'Lehe Pruulikoda'
}

const breweries = [brewery]

const styles = [{
  id: '15de46da-d720-4c27-bd94-9c04291cceed',
  name: 'Sour'
}]

const beer = {
  id: '91e91e26-2fa2-45ea-bda3-d66674bf8f1a',
  name: 'Doomino efekt',
  breweries,
  styles
}

const anotherBeer= {
  id: 'd18e490c-dfbc-4256-a272-64e54e6aa6f2',
  name: 'Incubus',
  breweries,
  styles
}

const beers = [
  beer,
  anotherBeer
]

test('selects beer', async () => {
  const user = userEvent.setup()
  const selector = vitest.fn()
  const { getByRole } = render(
    <SearchBeer
      searchBeerIf={{
        useSearch: () => ({
          search: async () => beers,
          isLoading: false
        })
      }}
      searchIf={activeSearch}
      select={selector}
    />
  )

  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Do')

  const itemButton = getByRole(
    'button',
    { name: `${beer.name} (${brewery.name})` }
  )
  expect(itemButton).toBeDefined()
  await user.click(itemButton)
  expect(selector.mock.calls).toEqual([[ {
    breweries: breweries.map(b => b.id),
    id: beer.id,
    name: beer.name,
    styles: styles.map(b => b.id)
  } ]])
})
