import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import createBrewery from './create'
import type {
  Brewery,
  CreateBreweryRequest,
  UseCreateBrewery,
  ValidateBrewery,
} from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBrewery: Brewery = {
  id: 'd1c2b3a4-5e6f-4708-9a1b-2c3d4e5f6a7b',
  name: 'Validated brewery',
  country: 'Sweden',
}

const created = { brewery: { id: 'created', name: 'Created brewery' } }

const request: CreateBreweryRequest = {
  name: 'Test brewery',
  country: 'Finland',
}

interface HelperProps {
  onCreate: (brewery: CreateBreweryRequest) => void
  onCreated: (brewery: Brewery) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreCreate: UseCreateBrewery = () => ({
    create: async (brewery: CreateBreweryRequest): Promise<unknown> => {
      props.onCreate(brewery)
      return created
    },
    isLoading: false,
  })
  const validate: ValidateBrewery = (result: unknown) => {
    props.onValidate(result)
    return validatedBrewery
  }
  const { create, isLoading } = createBrewery(
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

test('create brewery', async () => {
  const user = setupUser()
  const onCreate = vitest.fn()
  const onCreated = vitest.fn()
  const onValidate = vitest.fn()

  const { getByRole, getByText } = render(
    <Helper
      onCreate={onCreate}
      onCreated={onCreated}
      onValidate={onValidate}
    />,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(onCreated).toHaveBeenCalledWith(validatedBrewery)
  })
  expect(getByText('Not loading')).toBeDefined()
  expect(onCreate).toHaveBeenCalledWith(request)
  // The envelope is unwrapped before the validator sees the brewery.
  expect(onValidate).toHaveBeenCalledWith(created.brewery)
})
