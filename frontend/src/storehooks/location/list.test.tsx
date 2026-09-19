import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import listLocations from './list'
import type {
  LocationList,
  UseListLocations,
  ValidateLocationList,
  ValidateLocationListOrUndefined,
} from './types'
import type { Pagination } from '../types'
import { setupUser } from '../../../test-util/user-event'

// Stubs for the store function and the validators, for the reason given in
// get.test.tsx.
const validatedLocationList: LocationList = {
  locations: [
    {
      id: '3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f',
      name: 'Validated location',
    },
  ],
}

const listed = { locations: [{ id: 'listed', name: 'Listed location' }] }

const pagination: Pagination = { skip: 0, size: 10 }

interface HelperProps {
  data: unknown
  onList: (pagination: Pagination) => void
  onListed: (list: LocationList) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreList: UseListLocations = () => ({
    list: async (listPagination: Pagination): Promise<unknown> => {
      props.onList(listPagination)
      return listed
    },
    data: props.data,
    isFetching: false,
    isUninitialized: props.data === undefined,
  })
  const validate: ValidateLocationList = (result: unknown) => {
    props.onValidate(result)
    return validatedLocationList
  }
  const validateOrUndefined: ValidateLocationListOrUndefined = (
    result: unknown,
  ) => (result === undefined ? undefined : validate(result))
  const { list, locationList, isUninitialized } = listLocations(
    useStoreList,
    validate,
    validateOrUndefined,
  ).useList()
  return (
    <div>
      <div>{isUninitialized ? 'Uninitialized' : 'Initialized'}</div>
      {locationList?.locations.map((location) => (
        <div key={location.id}>{location.name}</div>
      ))}
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            props.onListed(await list(pagination))
          })()
        }}
      >
        List
      </button>
    </div>
  )
}

test('list locations', async () => {
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
    expect(onListed).toHaveBeenCalledWith(validatedLocationList)
  })
  expect(onList).toHaveBeenCalledWith(pagination)
  expect(onValidate).toHaveBeenCalledWith(listed)
})

test('the location list the store holds is validated on the way out', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper
      data={listed}
      onList={() => undefined}
      onListed={() => undefined}
      onValidate={onValidate}
    />,
  )

  expect(getByText(validatedLocationList.locations[0].name)).toBeDefined()
  expect(getByText('Initialized')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(listed)
})
