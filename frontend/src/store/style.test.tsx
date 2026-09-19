import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import { createServer } from '../../test-util/server'
import type { TestServer } from '../../test-util/server'
import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import {
  useCreateStyle,
  useGetStyle,
  useListStyles,
  useUpdateStyle,
} from './style'

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

const styleId = 'c4d5e6f7-0819-42ab-9c3d-4e5f6a7b8c9d'
const style = {
  id: styleId,
  name: 'Test style',
  parents: [],
}

function GetStyleHelper(): React.JSX.Element {
  const { data, isLoading } = useGetStyle(styleId)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('get style', async () => {
  const expectedResponse = { style: { ...style, children: [] } }
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/style/${styleId}`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <GetStyleHelper />
    </StoreProvider>,
  )
  expect(getByText('Loading')).toBeDefined()

  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function ListStylesHelper(): React.JSX.Element {
  const { data, isLoading } = useListStyles()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list styles', async () => {
  const expectedResponse = { styles: [style] }
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/style',
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListStylesHelper />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function CreateStyleHelper(): React.JSX.Element {
  const { create, data, hasError, isLoading, isSuccess } = useCreateStyle()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{hasError ? 'Failed' : 'Not failed'}</div>
      <div>{isSuccess ? 'Succeeded' : 'Not succeeded'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
      <button
        type='button'
        onClick={() => {
          void create({ name: style.name, parents: style.parents })
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create style', async () => {
  const user = setupUser()
  const expectedResponse = { style }
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/style',
    response: expectedResponse,
    status: 201,
  })

  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateStyleHelper />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(getByText('Succeeded')).toBeDefined()
  })
  expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  expect(getByText('Not failed')).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
})

test('fail to create style', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/style',
    response: { error: { code: 'CyclicRelationship' } },
    status: 400,
  })

  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateStyleHelper />
    </StoreProvider>,
  )

  // The creation does not reject: the form reads the outcome from hasError.
  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(getByText('Failed')).toBeDefined()
  })
  expect(getByText('Not succeeded')).toBeDefined()
})

function UpdateStyleHelper(props: {
  onResult: (result: unknown) => void
}): React.JSX.Element {
  const { update, hasError, isLoading, isSuccess } = useUpdateStyle()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{hasError ? 'Failed' : 'Not failed'}</div>
      <div>{isSuccess ? 'Succeeded' : 'Not succeeded'}</div>
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            props.onResult(await update(style))
          })()
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update style', async () => {
  const user = setupUser()
  const expectedResponse = { style }
  server?.addResponse({
    method: 'PUT',
    pathname: `/api/v1/style/${styleId}`,
    response: expectedResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <UpdateStyleHelper onResult={onResult} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(expectedResponse)
  })
  await waitFor(() => {
    expect(getByText('Succeeded')).toBeDefined()
  })
  expect(getByText('Not failed')).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
})
