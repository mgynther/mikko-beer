import { beforeAll, beforeEach, afterAll, test } from '../test'
import { assertCalledWith, assertDefined } from '../assert'
import { mockFunction } from '../mock'
import { render, waitFor } from '../render'

import { createServer } from './server'
import type { TestServer } from './server'
import { setupUser } from '../user-event'

import { StoreProvider } from '../../src/store/provider'
import {
  useCreateStyle,
  useGetStyle,
  useListStyles,
  useUpdateStyle,
} from '../../src/store/style'
import { createErrorLogger } from '../error-logger'

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
  assertDefined(getByText('Loading'))

  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(expectedResponse)))
  })
  assertDefined(getByText('Not loading'))
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
    assertDefined(getByText(JSON.stringify(expectedResponse)))
  })
  assertDefined(getByText('Not loading'))
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
          create({ name: style.name, parents: style.parents }).catch(
            createErrorLogger('create failed', console.error),
          )
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
    assertDefined(getByText('Succeeded'))
  })
  assertDefined(getByText(JSON.stringify(expectedResponse)))
  assertDefined(getByText('Not failed'))
  assertDefined(getByText('Not loading'))
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
    assertDefined(getByText('Failed'))
  })
  assertDefined(getByText('Not succeeded'))
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
          ;(async (): Promise<void> => {
            props.onResult(await update(style))
          })().catch(createErrorLogger('update failed', console.error))
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

  const onResult = mockFunction<[result: unknown]>()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <UpdateStyleHelper onResult={onResult} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    assertCalledWith(onResult, [expectedResponse])
  })
  await waitFor(() => {
    assertDefined(getByText('Succeeded'))
  })
  assertDefined(getByText('Not failed'))
  assertDefined(getByText('Not loading'))
})
