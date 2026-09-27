import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import createContainer from '../../../src/storehooks/container/create'
import type {
  Container,
  ContainerRequest,
  UseCreateContainer,
  ValidateContainer,
} from '../../../src/storehooks/container/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildContainer } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedContainer = buildContainer()

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
  const onCreate = mockFunction()
  const onCreated = mockFunction()
  const onValidate = mockFunction()

  const { getByRole, getByText } = render(
    <Helper
      onCreate={onCreate}
      onCreated={onCreated}
      onValidate={onValidate}
    />,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertCalledWith(onCreated, [validatedContainer])
  })
  assertDefined(getByText('Not loading'))
  assertCalledWith(onCreate, [request])
  // The envelope is unwrapped before the validator sees the container.
  assertCalledWith(onValidate, [created.container])
})
