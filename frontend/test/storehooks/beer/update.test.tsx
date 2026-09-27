import { test } from '../../test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDefined,
} from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import updateBeer from '../../../src/storehooks/beer/update'
import type {
  BeerWithIds,
  UseUpdateBeer,
  ValidateBeerWithIds,
} from '../../../src/storehooks/beer/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildBeerWithIds } from './builders'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBeer = buildBeerWithIds()

const updated = { beer: { id: 'updated', name: 'Updated beer' } }

const beer = buildBeerWithIds()

interface HelperProps {
  onUpdate: (beer: BeerWithIds) => void
  onUpdated: () => void
  onError: () => void
  validate: ValidateBeerWithIds
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreUpdate: UseUpdateBeer = () => ({
    update: async (updatedBeer: BeerWithIds): Promise<unknown> => {
      props.onUpdate(updatedBeer)
      return updated
    },
    isLoading: false,
  })
  const { update, isLoading } = updateBeer(
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
              await update(beer)
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

test('update beer', async () => {
  const user = setupUser()
  const onUpdate = mockFunction()
  const onUpdated = mockFunction()
  const onValidate = mockFunction()
  const validate: ValidateBeerWithIds = (result: unknown) => {
    onValidate(result)
    return validatedBeer
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
  assertCalledWith(onUpdate, [beer])
  assertCalledWith(onValidate, [updated.beer])
})

test('fail to update beer that does not validate', async () => {
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
