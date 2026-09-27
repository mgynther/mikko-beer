import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import createLocation from '../../../src/storehooks/location/create'
import type {
  Location,
  CreateLocationRequest,
  UseCreateLocation,
  ValidateLocation,
} from '../../../src/storehooks/location/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildLocation } from './builders'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedLocation = buildLocation()

const created = { location: { id: 'created', name: 'Created location' } }

const request: CreateLocationRequest = {
  name: 'Test location',
}

interface HelperProps {
  onCreate: (location: CreateLocationRequest) => void
  onCreated: (location: Location) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreCreate: UseCreateLocation = () => ({
    create: async (location: CreateLocationRequest): Promise<unknown> => {
      props.onCreate(location)
      return created
    },
    isLoading: false,
  })
  const validate: ValidateLocation = (result: unknown) => {
    props.onValidate(result)
    return validatedLocation
  }
  const { create, isLoading } = createLocation(
    useStoreCreate,
    validate,
  ).useCreate()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onCreated(await create(request))
          })().catch(createErrorLogger('create failed', console.error))
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create location', async () => {
  const user = setupUser()
  const onCreate = mockFunction<[location: CreateLocationRequest]>()
  const onCreated = mockFunction<[location: Location]>()
  const onValidate = mockFunction<[result: unknown]>()

  const { getByRole, getByText } = render(
    <Helper
      onCreate={onCreate}
      onCreated={onCreated}
      onValidate={onValidate}
    />,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertCalledWith(onCreated, [validatedLocation])
  })
  assertDefined(getByText('Not loading'))
  assertCalledWith(onCreate, [request])
  // The envelope is unwrapped before the validator sees the location.
  assertCalledWith(onValidate, [created.location])
})
