import { test } from '../test'
import { assertCalledWith, assertDefined } from '../assert'
import { mockFunction } from '../mock'
import { render, waitFor } from '../render'

import { createServer } from './server'
import { createMemoryStorage } from '../memory-storage'
import { setupUser } from '../user-event'

import { createStoreProvider } from '../../src/store/provider'
import {
  useCreateContainer,
  useListContainers,
  useUpdateContainer,
} from '../../src/store/container'
import { createErrorLogger } from '../error-logger'

// See store/beer.test.tsx for what the store layer's tests are for and why
// the helpers render the data as text.
const containerId = 'a2b3c4d5-e6f7-4089-9a1b-2c3d4e5f6a7b'
const container = {
  id: containerId,
  type: 'bottle',
  size: '0.33',
}

function ListContainersHelper(): React.JSX.Element {
  const { data, isLoading } = useListContainers()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list containers', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const expectedResponse = { containers: [container] }
  server.addResponse({
    method: 'GET',
    pathname: '/api/v1/container',
    response: expectedResponse,
    status: 200,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByText } = render(
    <StoreProvider>
      <ListContainersHelper />
    </StoreProvider>,
  )
  assertDefined(getByText('Loading'))

  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(expectedResponse)))
  })
  assertDefined(getByText('Not loading'))
})

interface TriggerProps {
  onResult: (result: unknown) => void
}

function CreateContainerHelper(props: TriggerProps): React.JSX.Element {
  const { create, isLoading } = useCreateContainer()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(
              await create({ type: container.type, size: container.size }),
            )
          })().catch(createErrorLogger('create failed', console.error))
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create container', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const expectedResponse = { container }
  server.addResponse({
    method: 'POST',
    pathname: '/api/v1/container',
    response: expectedResponse,
    status: 201,
  })

  const onResult = mockFunction<[result: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateContainerHelper onResult={onResult} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertCalledWith(onResult, [expectedResponse])
  })
  await waitFor(() => {
    assertDefined(getByText('Not loading'))
  })
})

function UpdateContainerHelper(props: TriggerProps): React.JSX.Element {
  const { update, isLoading } = useUpdateContainer()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(await update(container))
          })().catch(createErrorLogger('update failed', console.error))
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update container', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const expectedResponse = { container }
  server.addResponse({
    method: 'PUT',
    pathname: `/api/v1/container/${containerId}`,
    response: expectedResponse,
    status: 200,
  })

  const onResult = mockFunction<[result: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <UpdateContainerHelper onResult={onResult} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    assertCalledWith(onResult, [expectedResponse])
  })
  await waitFor(() => {
    assertDefined(getByText('Not loading'))
  })
})
