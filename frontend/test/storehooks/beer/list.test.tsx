import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import listBeers from '../../../src/storehooks/beer/list'
import type {
  BeerList,
  UseListBeers,
  ValidateBeerList,
  ValidateBeerListOrUndefined,
} from '../../../src/storehooks/beer/types'
import type { Pagination } from '../../../src/storehooks/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildBeer } from './builders'

// Stubs for the store function and the validators, for the reason given in
// get.test.tsx.
const validatedBeerList = {
  beers: [buildBeer({ name: 'Validated beer' })],
}

const listed = { beers: [{ id: 'listed', name: 'Listed beer' }] }

const pagination: Pagination = { skip: 0, size: 10 }

interface HelperProps {
  data: unknown
  onList: (pagination: Pagination) => void
  onListed: (list: BeerList) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreList: UseListBeers = () => ({
    list: async (listPagination: Pagination): Promise<unknown> => {
      props.onList(listPagination)
      return listed
    },
    data: props.data,
    isFetching: false,
    isUninitialized: props.data === undefined,
  })
  const validate: ValidateBeerList = (result: unknown) => {
    props.onValidate(result)
    return validatedBeerList
  }
  const validateOrUndefined: ValidateBeerListOrUndefined = (result: unknown) =>
    result === undefined ? undefined : validate(result)
  const { list, beerList, isUninitialized } = listBeers(
    useStoreList,
    validate,
    validateOrUndefined,
  ).useList()
  return (
    <div>
      <div>{isUninitialized ? 'Uninitialized' : 'Initialized'}</div>
      {beerList?.beers.map((beer) => (
        <div key={beer.id}>{beer.name}</div>
      ))}
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onListed(await list(pagination))
          })().catch(createErrorLogger('list failed', console.error))
        }}
      >
        List
      </button>
    </div>
  )
}

test('list beers', async () => {
  const user = setupUser()
  const onList = mockFunction()
  const onListed = mockFunction()
  const onValidate = mockFunction()

  const { getByRole, getByText } = render(
    <Helper
      data={undefined}
      onList={onList}
      onListed={onListed}
      onValidate={onValidate}
    />,
  )
  assertDefined(getByText('Uninitialized'))

  await user.click(getByRole('button', { name: 'List' }))
  await waitFor(() => {
    assertCalledWith(onListed, [validatedBeerList])
  })
  assertCalledWith(onList, [pagination])
  assertCalledWith(onValidate, [listed])
})

test('the beer list the store holds is validated on the way out', () => {
  const onValidate = mockFunction()

  const { getByText } = render(
    <Helper
      data={listed}
      onList={() => undefined}
      onListed={() => undefined}
      onValidate={onValidate}
    />,
  )

  assertDefined(getByText(validatedBeerList.beers[0].name))
  assertDefined(getByText('Initialized'))
  assertCalledWith(onValidate, [listed])
})
