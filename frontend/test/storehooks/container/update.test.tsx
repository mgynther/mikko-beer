import { test } from '../../test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDefined,
} from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import updateContainer from '../../../src/storehooks/container/update'
import type {
  Container,
  UseUpdateContainer,
  ValidateContainer,
} from '../../../src/storehooks/container/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildContainer } from './builders'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedContainer = buildContainer()

const updated = { container: { id: 'updated', type: 'can', size: '0.44' } }

const container = buildContainer()

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
          ;(async (): Promise<void> => {
            try {
              await update(container)
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

test('update container', async () => {
  const user = setupUser()
  const onUpdate = mockFunction()
  const onUpdated = mockFunction()
  const onValidate = mockFunction()
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
    assertCalled(onUpdated)
  })
  assertDefined(getByText('Not loading'))
  assertCalledWith(onUpdate, [container])
  assertCalledWith(onValidate, [updated.container])
})

test('fail to update container that does not validate', async () => {
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
