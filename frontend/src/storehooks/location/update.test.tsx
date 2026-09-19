import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import updateLocation from './update'
import type { Location, UseUpdateLocation, ValidateLocation } from './types'
import { setupUser } from '../../../test-util/user-event'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedLocation: Location = {
  id: '5d6e7f80-9a1b-42c3-8d4e-5f6a7b8c9d0e',
  name: 'Validated location',
}

const updated = { location: { id: 'updated', name: 'Updated location' } }

const location: Location = {
  id: '2b3c4d5e-6f70-4819-a2b3-c4d5e6f70819',
  name: 'Test location',
}

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
          void (async (): Promise<void> => {
            try {
              await update(location)
              props.onUpdated()
            } catch {
              props.onError()
            }
          })()
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
