import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

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
  const onUpdate = vitest.fn()
  const onUpdated = vitest.fn()
  const onValidate = vitest.fn()
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
    expect(onUpdated).toHaveBeenCalled()
  })
  expect(getByText('Not loading')).toBeDefined()
  expect(onUpdate).toHaveBeenCalledWith(location)
  expect(onValidate).toHaveBeenCalledWith(updated.location)
})

test('fail to update location that does not validate', async () => {
  const user = setupUser()
  const onUpdated = vitest.fn()
  const onError = vitest.fn()

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
    expect(onError).toHaveBeenCalled()
  })
  expect(onUpdated).not.toHaveBeenCalled()
})
