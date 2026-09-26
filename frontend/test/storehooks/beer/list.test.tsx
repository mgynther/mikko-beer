import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

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
  const onList = vitest.fn()
  const onListed = vitest.fn()
  const onValidate = vitest.fn()

  const { getByRole, getByText } = render(
    <Helper
      data={undefined}
      onList={onList}
      onListed={onListed}
      onValidate={onValidate}
    />,
  )
  expect(getByText('Uninitialized')).toBeDefined()

  await user.click(getByRole('button', { name: 'List' }))
  await waitFor(() => {
    expect(onListed).toHaveBeenCalledWith(validatedBeerList)
  })
  expect(onList).toHaveBeenCalledWith(pagination)
  expect(onValidate).toHaveBeenCalledWith(listed)
})

test('the beer list the store holds is validated on the way out', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper
      data={listed}
      onList={() => undefined}
      onListed={() => undefined}
      onValidate={onValidate}
    />,
  )

  expect(getByText(validatedBeerList.beers[0].name)).toBeDefined()
  expect(getByText('Initialized')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(listed)
})
