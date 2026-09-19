import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import createLocation from './create'
import type {
  Location,
  CreateLocationRequest,
  UseCreateLocation,
  ValidateLocation,
} from './types'
import { setupUser } from '../../../test-util/user-event'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedLocation: Location = {
  id: '6a2d7f8c-1b3e-4f5a-9c0d-2e4f6a8b0c1d',
  name: 'Validated location',
}

const created = { location: { id: 'created', name: 'Created location' } }

const request: CreateLocationRequest = {
  name: 'Test location',
}

interface HelperProps {
  onCreate: (location: CreateLocationRequest) => void
  onCreated: (location: Location) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreCreate: UseCreateLocation = () => ({
    create: async (location: CreateLocationRequest): Promise<unknown> => {
      props.onCreate(location)
      return created
    },
    isLoading: false,
  })
  const validate: ValidateLocation = (result: unknown) => {
    props.onValidate(result)
    return validatedLocation
  }
  const { create, isLoading } = createLocation(
    useStoreCreate,
    validate,
  ).useCreate()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            props.onCreated(await create(request))
          })()
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create location', async () => {
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
    expect(onCreated).toHaveBeenCalledWith(validatedLocation)
  })
  expect(getByText('Not loading')).toBeDefined()
  expect(onCreate).toHaveBeenCalledWith(request)
  // The envelope is unwrapped before the validator sees the location.
  expect(onValidate).toHaveBeenCalledWith(created.location)
})
