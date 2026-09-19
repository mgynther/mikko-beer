import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import updateContainer from './update'
import type { Container, UseUpdateContainer, ValidateContainer } from './types'
import { setupUser } from '../../../test-util/user-event'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedContainer: Container = {
  id: 'b2f1c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  type: 'validated',
  size: '0.33',
}

const updated = { container: { id: 'updated', type: 'can', size: '0.44' } }

const container: Container = {
  id: '9b1a2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5e',
  type: 'bottle',
  size: '0.50',
}

interface HelperProps {
  onUpdate: (container: Container) => void
  onUpdated: () => void
  onError: () => void
  validate: ValidateContainer
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreUpdate: UseUpdateContainer = () => ({
    update: async (updatedContainer: Container): Promise<unknown> => {
      props.onUpdate(updatedContainer)
      return updated
    },
    isLoading: false,
  })
  const { update, isLoading } = updateContainer(
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
              await update(container)
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

test('update container', async () => {
  const user = setupUser()
  const onUpdate = vitest.fn()
  const onUpdated = vitest.fn()
  const onValidate = vitest.fn()
  const validate: ValidateContainer = (result: unknown) => {
    onValidate(result)
    return validatedContainer
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
  expect(onUpdate).toHaveBeenCalledWith(container)
  expect(onValidate).toHaveBeenCalledWith(updated.container)
})

test('fail to update container that does not validate', async () => {
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
