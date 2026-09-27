import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import listBreweries from '../../../src/storehooks/brewery/list'
import type {
  BreweryList,
  UseListBreweries,
  ValidateBreweryList,
  ValidateBreweryListOrUndefined,
} from '../../../src/storehooks/brewery/types'
import type { Pagination } from '../../../src/storehooks/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildBrewery } from './builders'

// Stubs for the store function and the validators, for the reason given in
// get.test.tsx.
const validatedBreweryList = {
  breweries: [buildBrewery({ name: 'Validated brewery' })],
}

const listed = { breweries: [{ id: 'listed', name: 'Listed brewery' }] }

const pagination: Pagination = { skip: 0, size: 10 }

interface HelperProps {
  data: unknown
  onList: (pagination: Pagination) => void
  onListed: (list: BreweryList) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreList: UseListBreweries = () => ({
    list: async (listPagination: Pagination): Promise<unknown> => {
      props.onList(listPagination)
      return listed
    },
    data: props.data,
    isFetching: false,
    isUninitialized: props.data === undefined,
  })
  const validate: ValidateBreweryList = (result: unknown) => {
    props.onValidate(result)
    return validatedBreweryList
  }
  const validateOrUndefined: ValidateBreweryListOrUndefined = (
    result: unknown,
  ) => (result === undefined ? undefined : validate(result))
  const { list, breweryList, isUninitialized } = listBreweries(
    useStoreList,
    validate,
    validateOrUndefined,
  ).useList()
  return (
    <div>
      <div>{isUninitialized ? 'Uninitialized' : 'Initialized'}</div>
      {breweryList?.breweries.map((brewery) => (
        <div key={brewery.id}>{brewery.name}</div>
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

test('list breweries', async () => {
  const user = setupUser()
  const onList = mockFunction<[pagination: Pagination]>()
  const onListed = mockFunction<[list: BreweryList]>()
  const onValidate = mockFunction<[result: unknown]>()

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
    assertCalledWith(onListed, [validatedBreweryList])
  })
  assertCalledWith(onList, [pagination])
  assertCalledWith(onValidate, [listed])
})

test('the brewery list the store holds is validated on the way out', () => {
  const onValidate = mockFunction<[result: unknown]>()

  const { getByText } = render(
    <Helper
      data={listed}
      onList={() => undefined}
      onListed={() => undefined}
      onValidate={onValidate}
    />,
  )

  assertDefined(getByText(validatedBreweryList.breweries[0].name))
  assertDefined(getByText('Initialized'))
  assertCalledWith(onValidate, [listed])
})
