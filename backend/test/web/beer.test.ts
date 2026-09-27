import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type {
  BeerBody,
  BeerListBody,
  BeerSearchBody,
  ReadBeer,
  ReadBeerBody,
} from '../../src/web/beer/beer.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../../src/web/request.js'
import { TestServer } from './test-server.js'

const authorization = 'Bearer token'
const headers = { Authorization: authorization }

const beerId = '5f0c1b5e-6a4f-4d4e-9f0e-2b6a1b0f7c11'
const breweryId = 'c0d7e3a2-2f5b-4a0e-8d61-3f7a9b4e2c10'
const styleId = '9a4b8c6d-1e2f-4a3b-8c5d-6e7f8a9b0c1d'

const beerBody: BeerBody = {
  beer: {
    id: beerId,
    name: 'Pilsner Urquell',
    breweries: [breweryId],
    styles: [styleId],
  },
}

const readBeer: ReadBeer = {
  id: beerId,
  name: 'Pilsner Urquell',
  breweries: [{ id: breweryId, name: 'Plzeňský Prazdroj' }],
  styles: [{ id: styleId, name: 'Lager' }],
}

const requestBody = {
  name: 'Pilsner Urquell',
  breweries: [breweryId],
  styles: [styleId],
}

suite('beer routes', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  test('create a beer', async () => {
    const create = mockFunction<[request: BodyRequest], Promise<BeerBody>>(
      async () => beerBody,
    )
    await server.start({ beer: { create } })

    const res = await server.request.post('/api/v1/beer', requestBody, headers)

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, beerBody)
    assertDeepEqual(
      create.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: requestBody }]],
    )
  })

  test('update a beer', async () => {
    const update = mockFunction<[request: IdBodyRequest], Promise<BeerBody>>(
      async () => beerBody,
    )
    await server.start({ beer: { update } })

    const res = await server.request.put(
      `/api/v1/beer/${beerId}`,
      requestBody,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, beerBody)
    assertDeepEqual(
      update.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: beerId, body: requestBody }]],
    )
  })

  test('find a beer', async () => {
    const find = mockFunction<[request: IdRequest], Promise<ReadBeerBody>>(
      async () => ({ beer: readBeer }),
    )
    await server.start({ beer: { find } })

    const res = await server.request.get(`/api/v1/beer/${beerId}`, headers)

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { beer: readBeer })
    assertDeepEqual(
      find.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: beerId }]],
    )
  })

  test('list beers', async () => {
    const listBody: BeerListBody = {
      beers: [readBeer],
      pagination: { size: 20, skip: 40 },
    }
    const list = mockFunction<
      [request: PaginationRequest],
      Promise<BeerListBody>
    >(async () => listBody)
    await server.start({ beer: { list } })

    const res = await server.request.get(
      '/api/v1/beer?size=20&skip=40',
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, listBody)
    assertDeepEqual(
      list.mock.calls.map((call) => call.arguments),
      [[{ authorization, pagination: { size: '20', skip: '40' } }]],
    )
  })

  test('list beers without pagination', async () => {
    const list = mockFunction<
      [request: PaginationRequest],
      Promise<BeerListBody>
    >(async () => ({ beers: [], pagination: { size: 10000, skip: 0 } }))
    await server.start({ beer: { list } })

    await server.request.get('/api/v1/beer')

    assertDeepEqual(
      list.mock.calls.map((call) => call.arguments),
      [
        [
          {
            authorization: undefined,
            pagination: { size: undefined, skip: undefined },
          },
        ],
      ],
    )
  })

  test('search beers', async () => {
    const searchBody: BeerSearchBody = { beers: [readBeer] }
    const search = mockFunction<
      [request: BodyRequest],
      Promise<BeerSearchBody>
    >(async () => searchBody)
    await server.start({ beer: { search } })

    const res = await server.request.post(
      '/api/v1/beer/search',
      { name: 'urquell' },
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, searchBody)
    assertDeepEqual(
      search.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: { name: 'urquell' } }]],
    )
  })
})
