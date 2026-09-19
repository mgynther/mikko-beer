import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import searchBrewery from './search'
import type {
  Brewery,
  BreweryList,
  UseSearchBreweries,
  ValidateBreweryList,
} from './types'
import { setupUser } from '../../../test-util/user-event'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBreweryList: BreweryList = {
  breweries: [
    {
      id: '3a2b1c0d-9e8f-4706-8152-3c4d5e6f7a8b',
      name: 'Validated brewery',
      country: 'Norway',
    },
  ],
}

const found = { breweries: [{ id: 'found', name: 'Found brewery' }] }

interface HelperProps {
  onSearch: (name: string) => void
  onFound: (breweries: Brewery[]) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreSearch: UseSearchBreweries = () => ({
    search: async (name: string): Promise<unknown> => {
      props.onSearch(name)
      return found
    },
    isFetching: true,
  })
  const validate: ValidateBreweryList = (result: unknown) => {
    props.onValidate(result)
    return validatedBreweryList
  }
  const { search, isLoading } = searchBrewery(
    useStoreSearch,
    validate,
  ).useSearch()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            props.onFound(await search('brewery name'))
          })()
        }}
      >
        Search
      </button>
    </div>
  )
}

test('search breweries', async () => {
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
    expect(onFound).toHaveBeenCalledWith(validatedBreweryList.breweries)
  })
  expect(onSearch).toHaveBeenCalledWith('brewery name')
  expect(onValidate).toHaveBeenCalledWith(found)
})
