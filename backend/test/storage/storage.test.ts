import { expect } from 'chai'

import { TestContext } from '../test-context'
import { JoinedStorage, Storage } from '../../src/storage/storage'

describe('storage tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createDeps(adminAuthHeaders: Record<string, unknown>) {
    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek' },
      adminAuthHeaders
    )
    expect(styleRes.status).to.equal(201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      adminAuthHeaders
    )
    expect(breweryRes.status).to.equal(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemans Kriek', breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      adminAuthHeaders
    )

    expect(beerRes.status).to.equal(201)
    expect(beerRes.data.beer.name).to.equal('Lindemans Kriek')
    expect(beerRes.data.beer.breweries).to.eql([breweryRes.data.brewery.id])
    expect(beerRes.data.beer.styles).to.eql([styleRes.data.style.id])

    const containerRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      adminAuthHeaders
    )

    return {
      beerRes,
      breweryRes,
      containerRes,
      styleRes,
    }
  }

  const bestBefore = '2024-10-01T00:00:00.000Z'
  const bestBeforeLater = '2024-10-02T00:00:00.000Z'

  it('should create a storage', async () => {
    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(ctx.adminAuthHeaders())

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      {
        bestBefore,
        beer: beerRes.data.beer.id,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(storageRes.status).to.equal(201)
    expect(storageRes.data.storage.bestBefore).to.equal(bestBefore)
    expect(storageRes.data.storage.beer).to.equal(beerRes.data.beer.id)
    expect(storageRes.data.storage.container).to.equal(containerRes.data.container.id)

    const getRes = await ctx.request.get<{ storage: Storage }>(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.storage.id).to.equal(storageRes.data.storage.id)
    expect(getRes.data.storage.bestBefore).to.equal(bestBefore)
    expect(getRes.data.storage.beer).to.equal(beerRes.data.beer.id)
    expect(getRes.data.storage.container).to.equal(containerRes.data.container.id)

    const listRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      '/api/v1/storage/',
      ctx.adminAuthHeaders()
    )
    expect(listRes.status).to.equal(200)
    expect(listRes.data.storages.length).to.equal(1)
    expect(listRes.data.storages[0].id).to.eql(getRes.data.storage.id)
    expect(listRes.data.storages[0].beerId).to.eql(getRes.data.storage.beer)
    expect(listRes.data.storages[0].container).to.eql(containerRes.data.container)
    expect(listRes.data.storages[0].breweries[0]).to.eql(breweryRes.data.brewery)
    const parentlessStyle = { ...styleRes.data.style }
    delete parentlessStyle.parents
    expect(listRes.data.storages[0].styles[0]).to.eql(parentlessStyle)

    const skippedListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      '/api/v1/storage?size=50&skip=30',
      ctx.adminAuthHeaders()
    )
    expect(skippedListRes.status).to.equal(200)
    expect(skippedListRes.data.storages.length).to.equal(0)

    const breweryListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    expect(breweryListRes.status).to.equal(200)
    expect(breweryListRes.data.storages.length).to.equal(1)
    expect(breweryListRes.data.storages[0].id).to.eql(getRes.data.storage.id)
    expect(breweryListRes.data.storages[0].beerId).to.eql(getRes.data.storage.beer)

    const beerListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/beer/${beerRes.data.beer.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    expect(beerListRes.status).to.equal(200)
    expect(beerListRes.data.storages).to.eql(breweryListRes.data.storages)
  })

  it('should fail create a storage without beer', async () => {
    const { containerRes } = await createDeps(ctx.adminAuthHeaders())

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      {
        bestBefore,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(storageRes.status).to.equal(400)
  })

  it('should update a storage', async () => {
    const { beerRes, containerRes } = await createDeps(ctx.adminAuthHeaders())

    const requestData = {
      bestBefore,
      beer: beerRes.data.beer.id,
      container: containerRes.data.container.id,
    }

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      requestData, ctx.adminAuthHeaders()
    )
    expect(storageRes.status).to.equal(201)

    const updateRes = await ctx.request.put(`/api/v1/storage/${storageRes.data.storage.id}`,
      {
        ...requestData,
        bestBefore: bestBeforeLater
      },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).to.equal(200)

    const getRes = await ctx.request.get<{ storage: Storage }>(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.storage.bestBefore).to.equal(bestBeforeLater)
  })

  it('should get empty storage list', async () => {
    const res = await ctx.request.get(`/api/v1/storage`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).to.equal(200)
    expect(res.data.storages.length).to.equal(0)
  })

  it('should list storages by brewery', async () => {
    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(ctx.adminAuthHeaders())

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      {
        beer: beerRes.data.beer.id,
        bestBefore: bestBeforeLater,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(storageRes.status).to.equal(201)
    expect(storageRes.data.storage.beer).to.equal(beerRes.data.beer.id)

    const otherStyleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA' },
      ctx.adminAuthHeaders()
    )
    expect(otherStyleRes.status).to.equal(201)

    const otherBreweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Nokian Panimo' },
      ctx.adminAuthHeaders()
    )
    expect(otherBreweryRes.status).to.equal(201)

    const otherBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'IPA', breweries: [otherBreweryRes.data.brewery.id], styles: [otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )

    expect(otherBeerRes.status).to.equal(201)
    expect(otherBeerRes.data.beer.name).to.equal('IPA')
    expect(otherBeerRes.data.beer.breweries).to.eql([otherBreweryRes.data.brewery.id])
    expect(otherBeerRes.data.beer.styles).to.eql([otherStyleRes.data.style.id])

    const otherStorageRes = await ctx.request.post(`/api/v1/storage`,
      {
        beer: otherBeerRes.data.beer.id,
        bestBefore,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(otherStorageRes.status).to.equal(201)
    expect(otherStorageRes.data.storage.beer).to.equal(otherBeerRes.data.beer.id)

    const collabBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Wild Kriek IPA', breweries: [breweryRes.data.brewery.id, otherBreweryRes.data.brewery.id], styles: [styleRes.data.style.id, otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )
    expect(collabBeerRes.status).to.equal(201)
    expect(collabBeerRes.data.beer.name).to.equal('Wild Kriek IPA')

    const collabStorageRes = await ctx.request.post(`/api/v1/storage`,
      {
        beer: collabBeerRes.data.beer.id,
        bestBefore,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(collabStorageRes.status).to.equal(201)
    expect(collabStorageRes.data.storage.beer).to.equal(collabBeerRes.data.beer.id)

    const breweryListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    expect(breweryListRes.status).to.equal(200)
    expect(breweryListRes.data.storages.length).to.equal(2)
    const kriekStorage = breweryListRes.data.storages.find(storage => storage.id === storageRes.data.storage.id)
    expect(kriekStorage?.id).to.eql(storageRes.data.storage.id)
    expect(kriekStorage?.beerId).to.eql(storageRes.data.storage.beer)
    const collabStorage = breweryListRes.data.storages.find(storage => storage.id === collabStorageRes.data.storage.id)
    expect(collabStorage?.id).to.eql(collabStorageRes.data.storage.id)
    expect(collabStorage?.beerId).to.eql(collabStorageRes.data.storage.beer)
    expect(collabStorage?.breweries?.length).to.equal(2)
    const collabBrewery = collabStorage?.breweries?.find(brewery => brewery.id === breweryRes.data.brewery.id);
    const otherCollabBrewery = collabStorage?.breweries?.find(brewery => brewery.id === otherBreweryRes.data.brewery.id);
    expect(collabBrewery).to.eql({ id: breweryRes.data.brewery.id, name: breweryRes.data.brewery.name });
    expect(otherCollabBrewery).to.eql({ id: otherBreweryRes.data.brewery.id, name: otherBreweryRes.data.brewery.name });
    const collabStyle = collabStorage?.styles?.find(style => style.id === styleRes.data.style.id);
    const otherCollabStyle = collabStorage?.styles?.find(style => style.id === otherStyleRes.data.style.id);
    expect(collabStyle).to.eql({ id: styleRes.data.style.id, name: styleRes.data.style.name });
    expect(otherCollabStyle).to.eql({ id: otherStyleRes.data.style.id, name: otherStyleRes.data.style.name });

    const ids = breweryListRes.data.storages.map(storage => storage.id)
    expect(ids).to.eql([collabStorage?.id, kriekStorage?.id])
  })
})
