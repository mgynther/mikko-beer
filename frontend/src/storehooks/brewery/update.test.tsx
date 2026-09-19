import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import updateBrewery from './update'
import type { Brewery, UseUpdateBrewery, ValidateBrewery } from './types'
import { setupUser } from '../../../test-util/user-event'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBrewery: Brewery = {
  id: '6d5c4b3a-2e1f-4098-8765-4a3b2c1d0e9f',
  name: 'Validated brewery',
  country: 'Denmark',
}

const updated = { brewery: { id: 'updated', name: 'Updated brewery' } }

const brewery: Brewery = {
  id: 'c3b2a190-8f7e-4d6c-9b5a-4938271605f4',
  name: 'Test brewery',
  country: 'Finland',
}

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
          void (async (): Promise<void> => {
            try {
              await update(brewery)
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

test('update brewery', async () => {
  const user = setupUser()
  const onUpdate = vitest.fn()
  const onUpdated = vitest.fn()
  const onValidate = vitest.fn()
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
    expect(onUpdated).toHaveBeenCalled()
  })
  expect(getByText('Not loading')).toBeDefined()
  expect(onUpdate).toHaveBeenCalledWith(brewery)
  expect(onValidate).toHaveBeenCalledWith(updated.brewery)
})

test('fail to update brewery that does not validate', async () => {
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
