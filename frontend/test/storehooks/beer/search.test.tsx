import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import searchBeer from '../../../src/storehooks/beer/search'
import type {
  Beer,
  BeerList,
  UseSearchBeers,
  ValidateBeerList,
} from '../../../src/storehooks/beer/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildBeer } from './builders'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBeerList: BeerList = { beers: [buildBeer()] }

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
          ;(async (): Promise<void> => {
            props.onFound(await search('beer name'))
          })().catch(createErrorLogger('search failed', console.error))
        }}
      >
        Search
      </button>
    </div>
  )
}

test('search beers', async () => {
  const user = setupUser()
  const onSearch = mockFunction()
  const onValidate = mockFunction()
  const onFound = mockFunction()

  const { getByRole, getByText } = render(
    <Helper onSearch={onSearch} onFound={onFound} onValidate={onValidate} />,
  )
  assertDefined(getByText('Loading'))

  await user.click(getByRole('button', { name: 'Search' }))
  await waitFor(() => {
    assertCalledWith(onFound, [validatedBeerList.beers])
  })
  assertCalledWith(onSearch, ['beer name'])
  assertCalledWith(onValidate, [found])
})
