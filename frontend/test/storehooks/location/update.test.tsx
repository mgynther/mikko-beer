import { test } from '../../test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDefined,
} from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import updateLocation from '../../../src/storehooks/location/update'
import type {
  Location,
  UseUpdateLocation,
  ValidateLocation,
} from '../../../src/storehooks/location/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildLocation } from './builders'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedLocation = buildLocation()

const updated = { location: { id: 'updated', name: 'Updated location' } }

const location = buildLocation()

interface HelperProps {
  onUpdate: (location: Location) => void
  onUpdated: () => void
  onError: () => void
  validate: ValidateLocation
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreUpdate: UseUpdateLocation = () => ({
    update: async (updatedLocation: Location): Promise<unknown> => {
      props.onUpdate(updatedLocation)
      return updated
    },
    isLoading: false,
  })
  const { update, isLoading } = updateLocation(
    useStoreUpdate,
    props.validate,
  ).useUpdate()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            try {
              await update(location)
              props.onUpdated()
            } catch {
              props.onError()
            }
          })().catch(createErrorLogger('update failed', console.error))
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update location', async () => {
  const user = setupUser()
  const onUpdate = mockFunction()
  const onUpdated = mockFunction()
  const onValidate = mockFunction()
  const validate: ValidateLocation = (result: unknown) => {
    onValidate(result)
    return validatedLocation
  }

  const { getByRole, getByText } = render(
    <Helper
      onUpdate={onUpdate}
      onUpdated={onUpdated}
      onError={() => undefined}
      validate={validate}
    />,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    assertCalled(onUpdated)
  })
  assertDefined(getByText('Not loading'))
  assertCalledWith(onUpdate, [location])
  assertCalledWith(onValidate, [updated.location])
})

test('fail to update location that does not validate', async () => {
  const user = setupUser()
  const onUpdated = mockFunction()
  const onError = mockFunction()

  const { getByRole } = render(
    <Helper
      onUpdate={() => undefined}
      onUpdated={onUpdated}
      onError={onError}
      validate={() => {
        throw Error('Could not validate data')
      }}
    />,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  // A response that does not validate must not be reported as a successful
  // update: the throw propagates out of update and what follows it is never
  // reached.
  await waitFor(() => {
    assertCalled(onError)
  })
  assertCallCount(onUpdated, 0)
})
