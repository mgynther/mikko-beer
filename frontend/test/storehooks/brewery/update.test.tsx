import { test } from '../../test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDefined,
} from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import updateBrewery from '../../../src/storehooks/brewery/update'
import type {
  Brewery,
  UseUpdateBrewery,
  ValidateBrewery,
} from '../../../src/storehooks/brewery/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildBrewery } from './builders'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBrewery = buildBrewery()

const updated = { brewery: { id: 'updated', name: 'Updated brewery' } }

const brewery = buildBrewery()

interface HelperProps {
  onUpdate: (brewery: Brewery) => void
  onUpdated: () => void
  onError: () => void
  validate: ValidateBrewery
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreUpdate: UseUpdateBrewery = () => ({
    update: async (updatedBrewery: Brewery): Promise<unknown> => {
      props.onUpdate(updatedBrewery)
      return updated
    },
    isLoading: false,
  })
  const { update, isLoading } = updateBrewery(
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
              await update(brewery)
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

test('update brewery', async () => {
  const user = setupUser()
  const onUpdate = mockFunction()
  const onUpdated = mockFunction()
  const onValidate = mockFunction()
  const validate: ValidateBrewery = (result: unknown) => {
    onValidate(result)
    return validatedBrewery
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
  assertCalledWith(onUpdate, [brewery])
  assertCalledWith(onValidate, [updated.brewery])
})

test('fail to update brewery that does not validate', async () => {
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
