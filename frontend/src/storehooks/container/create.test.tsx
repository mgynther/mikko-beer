import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import createContainer from './create'
import type {
  Container,
  ContainerRequest,
  UseCreateContainer,
  ValidateContainer,
} from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedContainer: Container = {
  id: '0d4e3e4b-3d1e-4a7e-9a0e-b0a5a1c9e7f2',
  type: 'validated',
  size: '0.25',
}

const created = { container: { id: 'created', type: 'bottle', size: '0.33' } }

const request: ContainerRequest = { type: 'bottle', size: '0.33' }

interface HelperProps {
  onCreate: (container: ContainerRequest) => void
  onCreated: (container: Container) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreCreate: UseCreateContainer = () => ({
    create: async (container: ContainerRequest): Promise<unknown> => {
      props.onCreate(container)
      return created
    },
    isLoading: false,
  })
  const validate: ValidateContainer = (result: unknown) => {
    props.onValidate(result)
    return validatedContainer
  }
  const { create, isLoading } = createContainer(
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

test('create container', async () => {
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
    expect(onCreated).toHaveBeenCalledWith(validatedContainer)
  })
  expect(getByText('Not loading')).toBeDefined()
  expect(onCreate).toHaveBeenCalledWith(request)
  // The envelope is unwrapped before the validator sees the container.
  expect(onValidate).toHaveBeenCalledWith(created.container)
})
