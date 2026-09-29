import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type { BeerListBody, BeerSearchBody } from '../../src/web/beer/beer.js'
import type { ErrorResponse } from '../../src/web/error-response.js'
import type { BodyRequest, PaginationRequest } from '../../src/web/request.js'
import type { WebErrors } from '../../src/web/web-server.js'
import {
  repeatedQueryParameterResponse,
  testWebErrors,
  TestServer,
  unreadableBodyResponse,
} from './test-server.js'

// Any route will do for what the server does around every route; listing
// beers is the simplest.
function listBeers() {
  return mockFunction<[request: PaginationRequest], Promise<BeerListBody>>(
    async () => ({ beers: [], pagination: { size: 10000, skip: 0 } }),
  )
}

suite('web server', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  test('add the cross-origin headers', async () => {
    await server.start({ beer: { list: listBeers() } })

    const res = await fetch('http://localhost:3003/api/v1/beer')

    assertDeepEqual(
      [
        res.headers.get('Access-Control-Allow-Origin'),
        res.headers.get('Access-Control-Allow-Headers'),
        res.headers.get('Access-Control-Allow-Methods'),
        res.headers.get('Vary'),
      ],
      [
        '*',
        'Authorization, Content-Type',
        'GET,PUT,POST,DELETE',
        'Origin, Accept-Encoding',
      ],
    )
  })

  test('answer what the error handler makes of a thrown error', async () => {
    const error = new Error('handler failed')
    const handle = mockFunction<[error: unknown], ErrorResponse>(() => ({
      status: 404,
      body: { error: { code: 'BeerNotFound', message: 'beer not found' } },
    }))
    const errors: WebErrors = { ...testWebErrors, handle }
    await server.start(
      {
        beer: {
          list: async () => {
            throw error
          },
        },
      },
      errors,
    )

    const res = await server.request.get('/api/v1/beer')

    assertEqual(res.status, 404)
    assertDeepEqual(res.data, {
      error: { code: 'BeerNotFound', message: 'beer not found' },
    })
    assertDeepEqual(
      handle.mock.calls.map((call) => call.arguments),
      [[error]],
    )
  })

  test('reject a repeated query parameter before the handler', async () => {
    const list = listBeers()
    await server.start({ beer: { list } })

    const res = await server.request.get('/api/v1/beer?size=20&size=30&skip=0')

    assertEqual(res.status, repeatedQueryParameterResponse.status)
    assertDeepEqual(res.data, repeatedQueryParameterResponse.body)
    assertEqual(list.mock.callCount(), 0)
  })

  test('reject a repeated query parameter the route does not read', async () => {
    const list = listBeers()
    await server.start({ beer: { list } })

    const res = await server.request.get('/api/v1/beer?unknown=a&unknown=b')

    assertEqual(res.status, repeatedQueryParameterResponse.status)
    assertEqual(list.mock.callCount(), 0)
  })

  test('answer 404 for a path without a route', async () => {
    await server.start({})

    const res = await server.request.get('/api/v1/wine')

    assertEqual(res.status, 404)
  })

  test('answer 405 for a method the path has no route for', async () => {
    await server.start({})

    const res = await server.request.delete('/api/v1/beer')

    assertEqual(res.status, 405)
  })

  test('reject a malformed body before the handler', async () => {
    await server.start({})

    const res = await fetch('http://localhost:3003/api/v1/beer', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"name": ',
    })

    assertEqual(res.status, unreadableBodyResponse.status)
    assertDeepEqual(await res.json(), unreadableBodyResponse.body)
  })

  test('reject a body over the size limit before the handler', async () => {
    await server.start({})

    const res = await fetch('http://localhost:3003/api/v1/beer', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'x'.repeat(1024 * 1024) }),
    })

    assertEqual(res.status, unreadableBodyResponse.status)
    assertDeepEqual(await res.json(), unreadableBodyResponse.body)
  })

  test('leave a form body unread', async () => {
    const search = mockFunction<
      [request: BodyRequest],
      Promise<BeerSearchBody>
    >(async () => ({ beers: [] }))
    await server.start({ beer: { search } })

    const res = await fetch('http://localhost:3003/api/v1/beer/search', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'name=Weihenstephaner',
    })

    assertEqual(res.status, 200)
    assertDeepEqual(
      search.mock.calls.map((call) => call.arguments),
      [[{ authorization: undefined, body: {} }]],
    )
  })

  test('close a server that never listened', async () => {
    await server.afterEach()
  })
})
