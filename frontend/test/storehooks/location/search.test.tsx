import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import searchLocation from '../../../src/storehooks/location/search'
import type {
  Location,
  LocationList,
  UseSearchLocations,
  ValidateLocationList,
} from '../../../src/storehooks/location/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildLocation } from './builders'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedLocationList: LocationList = { locations: [buildLocation()] }

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
          ;(async (): Promise<void> => {
            props.onFound(await search('location name'))
          })().catch(createErrorLogger('search failed', console.error))
        }}
      >
        Search
      </button>
    </div>
  )
}

test('search locations', async () => {
  const user = setupUser()
  const onSearch = mockFunction<[name: string]>()
  const onValidate = mockFunction<[result: unknown]>()
  const onFound = mockFunction<[locations: Location[]]>()

  const { getByRole, getByText } = render(
    <Helper onSearch={onSearch} onFound={onFound} onValidate={onValidate} />,
  )
  assertDefined(getByText('Loading'))

  await user.click(getByRole('button', { name: 'Search' }))
  await waitFor(() => {
    assertCalledWith(onFound, [validatedLocationList.locations])
  })
  assertCalledWith(onSearch, ['location name'])
  assertCalledWith(onValidate, [found])
})
