import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import updateBeer from './update'
import type { BeerWithIds, UseUpdateBeer, ValidateBeerWithIds } from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBeer: BeerWithIds = {
  id: 'a1b2c3d4-e5f6-4708-9192-a3b4c5d6e7f8',
  name: 'Validated beer',
  breweries: [],
  styles: [],
}

const updated = { beer: { id: 'updated', name: 'Updated beer' } }

const beer: BeerWithIds = {
  id: 'd4c3b2a1-f6e5-4807-9291-8f7e6d5c4b3a',
  name: 'Test beer',
  breweries: [],
  styles: [],
}

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
  const onUpdate = vitest.fn()
  const onUpdated = vitest.fn()
  const onValidate = vitest.fn()
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
    expect(onUpdated).toHaveBeenCalled()
  })
  expect(getByText('Not loading')).toBeDefined()
  expect(onUpdate).toHaveBeenCalledWith(beer)
  expect(onValidate).toHaveBeenCalledWith(updated.beer)
})

test('fail to update beer that does not validate', async () => {
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
