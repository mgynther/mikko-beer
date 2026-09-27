import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import searchBrewery from '../../../src/storehooks/brewery/search'
import type {
  Brewery,
  BreweryList,
  UseSearchBreweries,
  ValidateBreweryList,
} from '../../../src/storehooks/brewery/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildBrewery } from './builders'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBreweryList: BreweryList = { breweries: [buildBrewery()] }

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
          ;(async (): Promise<void> => {
            props.onFound(await search('brewery name'))
          })().catch(createErrorLogger('search failed', console.error))
        }}
      >
        Search
      </button>
    </div>
  )
}

test('search breweries', async () => {
  const user = setupUser()
  const onSearch = mockFunction<[name: string]>()
  const onValidate = mockFunction<[result: unknown]>()
  const onFound = mockFunction<[breweries: Brewery[]]>()

  const { getByRole, getByText } = render(
    <Helper onSearch={onSearch} onFound={onFound} onValidate={onValidate} />,
  )
  assertDefined(getByText('Loading'))

  await user.click(getByRole('button', { name: 'Search' }))
  await waitFor(() => {
    assertCalledWith(onFound, [validatedBreweryList.breweries])
  })
  assertCalledWith(onSearch, ['brewery name'])
  assertCalledWith(onValidate, [found])
})
