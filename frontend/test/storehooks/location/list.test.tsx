import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import listLocations from '../../../src/storehooks/location/list'
import type {
  LocationList,
  UseListLocations,
  ValidateLocationList,
  ValidateLocationListOrUndefined,
} from '../../../src/storehooks/location/types'
import type { Pagination } from '../../../src/storehooks/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildLocation } from './builders'

// Stubs for the store function and the validators, for the reason given in
// get.test.tsx.
const validatedLocationList = {
  locations: [buildLocation({ name: 'Validated location' })],
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

test('list locations', async () => {
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
    assertCalledWith(onListed, [validatedLocationList])
  })
  assertCalledWith(onList, [pagination])
  assertCalledWith(onValidate, [listed])
})

test('the location list the store holds is validated on the way out', () => {
  const onValidate = mockFunction()

  const { getByText } = render(
    <Helper
      data={listed}
      onList={() => undefined}
      onListed={() => undefined}
      onValidate={onValidate}
    />,
  )

  assertDefined(getByText(validatedLocationList.locations[0].name))
  assertDefined(getByText('Initialized'))
  assertCalledWith(onValidate, [listed])
})
