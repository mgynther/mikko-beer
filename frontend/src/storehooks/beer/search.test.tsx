import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import searchBeer from './search'
import type { Beer, BeerList, UseSearchBeers, ValidateBeerList } from './types'
import { setupUser } from '../../../test-util/user-event'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBeerList: BeerList = {
  beers: [
    {
      id: '7f809192-a3b4-45c6-97d8-e9f0a1b2c3d4',
      name: 'Validated beer',
      breweries: [],
      styles: [],
    },
  ],
}

const found = { beers: [{ id: 'found', name: 'Found beer' }] }

interface HelperProps {
  onSearch: (name: string) => void
  onFound: (beers: Beer[]) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreSearch: UseSearchBeers = () => ({
    search: async (name: string): Promise<unknown> => {
      props.onSearch(name)
      return found
    },
    isFetching: true,
  })
  const validate: ValidateBeerList = (result: unknown) => {
    props.onValidate(result)
    return validatedBeerList
  }
  const { search, isLoading } = searchBeer(useStoreSearch, validate).useSearch()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            props.onFound(await search('beer name'))
          })()
        }}
      >
        Search
      </button>
    </div>
  )
}

test('search beers', async () => {
  const user = setupUser()
  const onSearch = vitest.fn()
  const onValidate = vitest.fn()
  const onFound = vitest.fn()

  const { getByRole, getByText } = render(
    <Helper onSearch={onSearch} onFound={onFound} onValidate={onValidate} />,
  )
  expect(getByText('Loading')).toBeDefined()

  await user.click(getByRole('button', { name: 'Search' }))
  await waitFor(() => {
    expect(onFound).toHaveBeenCalledWith(validatedBeerList.beers)
  })
  expect(onSearch).toHaveBeenCalledWith('beer name')
  expect(onValidate).toHaveBeenCalledWith(found)
})
