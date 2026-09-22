import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import listBreweries from './list'
import type {
  BreweryList,
  UseListBreweries,
  ValidateBreweryList,
  ValidateBreweryListOrUndefined,
} from './types'
import type { Pagination } from '../types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store function and the validators, for the reason given in
// get.test.tsx.
const validatedBreweryList: BreweryList = {
  breweries: [
    {
      id: '0f1e2d3c-4b5a-4968-8778-6a5b4c3d2e1f',
      name: 'Validated brewery',
      country: undefined,
    },
  ],
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
    expect(onListed).toHaveBeenCalledWith(validatedBreweryList)
  })
  expect(onList).toHaveBeenCalledWith(pagination)
  expect(onValidate).toHaveBeenCalledWith(listed)
})

test('the brewery list the store holds is validated on the way out', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper
      data={listed}
      onList={() => undefined}
      onListed={() => undefined}
      onValidate={onValidate}
    />,
  )

  expect(getByText(validatedBreweryList.breweries[0].name)).toBeDefined()
  expect(getByText('Initialized')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(listed)
})
