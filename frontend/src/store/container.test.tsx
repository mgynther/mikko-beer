import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import { createServer } from '../../test-util/server'
import type { TestServer } from '../../test-util/server'
import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import {
  useCreateContainer,
  useListContainers,
  useUpdateContainer,
} from './container'

// See store/beer.test.tsx for what the store layer's tests are for and why
// the helpers render the data as text.
let server: TestServer | undefined

beforeAll(() => {
  server = createServer()
})

beforeEach(() => {
  server?.clear()
})

afterAll(() => {
  server?.close()
})

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
  const expectedResponse = { containers: [container] }
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/container',
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListContainersHelper />
    </StoreProvider>,
  )
  expect(getByText('Loading')).toBeDefined()

  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
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
          void (async (): Promise<void> => {
            props.onResult(
              await create({ type: container.type, size: container.size }),
            )
          })()
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create container', async () => {
  const user = setupUser()
  const expectedResponse = { container }
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/container',
    response: expectedResponse,
    status: 201,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateContainerHelper onResult={onResult} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(expectedResponse)
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
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
          void (async (): Promise<void> => {
            props.onResult(await update(container))
          })()
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update container', async () => {
  const user = setupUser()
  const expectedResponse = { container }
  server?.addResponse({
    method: 'PUT',
    pathname: `/api/v1/container/${containerId}`,
    response: expectedResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <UpdateContainerHelper onResult={onResult} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(expectedResponse)
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
})
