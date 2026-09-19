import React from 'react'

import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { StoreProvider } from '../src/store/provider'
import { createServer } from './server'
import type { TestServer } from './server'
import createBeer from '../src/storehooks/beer/create'
import { useCreateBeer } from '../src/store/beer'
import type {
  BeerWithIds,
  CreateBeerRequest,
} from '../src/storehooks/beer/types'
import { render, waitFor } from '@testing-library/react'
import { setupUser } from './user-event'

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
  // The request never succeeds here, so the validator is never called. It is
  // a stub anyway: this test is about the test server, not about beers.
  const createIf = createBeer(useCreateBeer, () => {
    throw Error('Nothing to validate')
  })
  const create = createIf.useCreate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      try {
        await create.create(props.beer)
      } catch (e) {
        props.handleResponse(e)
      }
    }
    void doHandle()
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

  const expectedResponse: { beer: BeerWithIds } = {
    beer: {
      id: '09901f8e-8a7d-47e7-8f7d-83068967ee72',
      name: 'Test beer',
      breweries: [],
      styles: [],
    },
  }

  server?.addResponse<{ beer: BeerWithIds }>({
    method: 'POST',
    pathname: '/api/v1/thisiswrong',
    response: expectedResponse,
    status: 201,
  })

  const handler = vitest.fn()
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
    expect(handler).toHaveBeenCalledWith({
      data: {
        errorMessage:
          'Unexpected request with method POST to path /api/v1/beer',
      },
      status: 500,
    })
  })
})
