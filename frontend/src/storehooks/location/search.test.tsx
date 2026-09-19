import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import searchLocation from './search'
import type {
  Location,
  LocationList,
  UseSearchLocations,
  ValidateLocationList,
} from './types'
import { setupUser } from '../../../test-util/user-event'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedLocationList: LocationList = {
  locations: [
    {
      id: '7f8e9d0c-1b2a-4394-8576-a1b2c3d4e5f6',
      name: 'Validated location',
    },
  ],
}

const found = { locations: [{ id: 'found', name: 'Found location' }] }

interface HelperProps {
  onSearch: (name: string) => void
  onFound: (locations: Location[]) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreSearch: UseSearchLocations = () => ({
    search: async (name: string): Promise<unknown> => {
      props.onSearch(name)
      return found
    },
    isFetching: true,
  })
  const validate: ValidateLocationList = (result: unknown) => {
    props.onValidate(result)
    return validatedLocationList
  }
  const { search, isLoading } = searchLocation(
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
            props.onFound(await search('location name'))
          })()
        }}
      >
        Search
      </button>
    </div>
  )
}

test('search locations', async () => {
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
    expect(onFound).toHaveBeenCalledWith(validatedLocationList.locations)
  })
  expect(onSearch).toHaveBeenCalledWith('location name')
  expect(onValidate).toHaveBeenCalledWith(found)
})
