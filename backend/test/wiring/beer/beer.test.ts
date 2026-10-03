import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import type {
  BeerBody,
  BeerListBody,
  BeerSearchBody,
  ReadBeer,
  ReadBeerBody,
} from '../../../src/web/beer/beer.js'
import type { CreatedOrUpdatedBrewery } from '../../../src/web/brewery/brewery.js'
import type { CreatedOrUpdatedStyle } from '../../../src/web/style/style.js'

interface BeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

// What a beer is brewed by and what style it is.
interface Origin {
  brewery: CreatedOrUpdatedBrewery
  style: CreatedOrUpdatedStyle
}

function beerRequest(name: string, { brewery, style }: Origin): BeerRequest {
  return { name, breweries: [brewery.id], styles: [style.id] }
}

function read(id: string, name: string, { brewery, style }: Origin): ReadBeer {
  return {
    id,
    name,
    breweries: [{ id: brewery.id, name: brewery.name }],
    styles: [{ id: style.id, name: style.name }],
  }
}

suite('beer tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createOrigin(
    breweryName: string,
    styleName: string,
  ): Promise<Origin> {
    const [styleRes, breweryRes] = await Promise.all([
      ctx.request.post<{ style: CreatedOrUpdatedStyle }>(
        `/api/v1/style`,
        { name: styleName, parents: [] },
        ctx.adminAuthHeaders(),
      ),
      ctx.request.post<{ brewery: CreatedOrUpdatedBrewery }>(
        `/api/v1/brewery`,
        { name: breweryName },
        ctx.adminAuthHeaders(),
      ),
    ])
    assertEqual(styleRes.status, 201)
    assertEqual(breweryRes.status, 201)
    return { brewery: breweryRes.data.brewery, style: styleRes.data.style }
  }

  async function createBeer(request: BeerRequest): Promise<string> {
    const res = await ctx.request.post<BeerBody>(
      `/api/v1/beer`,
      request,
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 201)
    return res.data.beer.id
  }

  test('create a beer', async () => {
    const origin = await createOrigin('Lindemans', 'Kriek')
    const request = beerRequest('Lindemans Kriek', origin)

    const res = await ctx.request.post<BeerBody>(
      `/api/v1/beer`,
      request,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, { beer: { ...request, id: res.data.beer.id } })
  })

  test('find a beer', async () => {
    const origin = await createOrigin('Lindemans', 'Kriek')
    const id = await createBeer(beerRequest('Lindemans Kriek', origin))

    const res = await ctx.request.get<ReadBeerBody>(
      `/api/v1/beer/${id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { beer: read(id, 'Lindemans Kriek', origin) })
  })

  // The beer's breweries and styles are replaced in the same transaction,
  // which only reading it back shows.
  test('update a beer', async () => {
    const [kriek, ipa] = await Promise.all([
      createOrigin('Lindemans', 'Kriek'),
      createOrigin('Sierra Nevada', 'IPA'),
    ])
    const id = await createBeer(beerRequest('Lindemans Kriek', kriek))
    const update = beerRequest('Torpedo', ipa)

    const res = await ctx.request.put<BeerBody>(
      `/api/v1/beer/${id}`,
      update,
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { beer: { ...update, id } })

    const getRes = await ctx.request.get<ReadBeerBody>(
      `/api/v1/beer/${id}`,
      ctx.adminAuthHeaders(),
    )
    assertDeepEqual(getRes.data, { beer: read(id, 'Torpedo', ipa) })
  })

  test('list beers', async () => {
    const origin = await createOrigin('Lindemans', 'Kriek')
    const id = await createBeer(beerRequest('Lindemans Kriek', origin))

    const res = await ctx.request.get<BeerListBody>(
      `/api/v1/beer?size=10&skip=0`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      beers: [read(id, 'Lindemans Kriek', origin)],
      pagination: { size: 10, skip: 0 },
    })
  })

  test('search beers', async () => {
    const [kriek, ipa] = await Promise.all([
      createOrigin('Lindemans', 'Kriek'),
      createOrigin('Sierra Nevada', 'IPA'),
    ])
    const [id] = await Promise.all([
      createBeer(beerRequest('Lindemans Kriek', kriek)),
      createBeer(beerRequest('Torpedo', ipa)),
    ])

    const res = await ctx.request.post<BeerSearchBody>(
      '/api/v1/beer/search',
      { name: 'Kriek' },
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { beers: [read(id, 'Lindemans Kriek', kriek)] })
  })
})
