import { beforeAll, beforeEach, afterAll, test } from '../test'
import { assertCalledWith } from '../assert'
import { mockFunction } from '../mock'
import { render, waitFor } from '../render'
import { StoreProvider } from '../../src/store/provider'
import { createServer } from './server'
import type { TestServer } from './server'
import { useCreateBeer, useGetBeer } from '../../src/store/beer'
import type { CreateBeerRequest } from '../../src/store/internal/beer/requests'
import { setupUser } from '../user-event'
import { createErrorLogger } from '../error-logger'

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

interface HelperProps {
  beer: CreateBeerRequest
  handleResponse: (e: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const create = useCreateBeer()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      try {
        await create.create(props.beer)
      } catch (e) {
        props.handleResponse(e)
      }
    }
    doHandle().catch(createErrorLogger('doHandle failed', console.error))
  }
  // A plain button rather than the application's own: this test is about the
  // test server, and reaching into the components layer for a button would
  // make it about that too.
  return (
    <button type='button' onClick={handleClick}>
      Test
    </button>
  )
}

test('test server responds with 500 to unexpected request', async () => {
  const user = setupUser()

  const expectedResponse = {
    beer: {
      id: '09901f8e-8a7d-47e7-8f7d-83068967ee72',
      name: 'Test beer',
      breweries: [],
      styles: [],
    },
  }

  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/thisiswrong',
    response: expectedResponse,
    status: 201,
  })

  const handler = mockFunction<[e: unknown]>()
  const { getByRole } = render(
    <StoreProvider>
      <Helper
        beer={{
          name: expectedResponse.beer.name,
          breweries: expectedResponse.beer.breweries,
          styles: expectedResponse.beer.styles,
        }}
        handleResponse={handler}
      />
    </StoreProvider>,
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    assertCalledWith(handler, [
      {
        data: {
          errorMessage:
            'Unexpected request with method POST to path /api/v1/beer',
        },
        status: 500,
      },
    ])
  })
})

test('test server hands the request body to onRequest', async () => {
  const user = setupUser()
  const beer: CreateBeerRequest = {
    name: 'Pilsner Urquell',
    breweries: ['e8d3a4a5-5b1f-4f2e-9d65-1c1b7f0f6a2e'],
    styles: ['0b8f4d57-5e2c-4bd4-8a44-4c1f0b3f5c1a'],
  }
  const onRequest = mockFunction<[body: unknown]>()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/beer',
    response: {
      beer: {
        id: '6f6e1f0e-7a39-4b39-a3c9-3a2e7b0e4f11',
        name: beer.name,
        breweries: beer.breweries,
        styles: beer.styles,
      },
    },
    status: 201,
    onRequest,
  })

  const { getByRole } = render(
    <StoreProvider>
      <Helper beer={beer} handleResponse={() => undefined} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'Test' }))
  await waitFor(() => {
    assertCalledWith(onRequest, [beer])
  })
})

function GetHelper(props: { beerId: string }): React.JSX.Element {
  const { isLoading } = useGetBeer(props.beerId)
  return <div>{isLoading ? 'Loading' : 'Not loading'}</div>
}

test('test server hands onRequest no body when there is none', async () => {
  const beerId = '2d0f5b0e-94c1-4c43-9a4f-7b0d3a51e8c6'
  const onRequest = mockFunction<[body: unknown]>()
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/beer/${beerId}`,
    response: {
      beer: { id: beerId, name: 'Guinness', breweries: [], styles: [] },
    },
    status: 200,
    onRequest,
  })

  render(
    <StoreProvider>
      <GetHelper beerId={beerId} />
    </StoreProvider>,
  )
  await waitFor(() => {
    assertCalledWith(onRequest, [undefined])
  })
})
