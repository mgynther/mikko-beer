import { expect } from 'earl'

import { TestContext } from '../test-context'
import { JoinedStorage, Storage } from '../../../src/core/storage/storage'

describe('storage tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createDeps(adminAuthHeaders: Record<string, unknown>) {
    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek', parents: [] },
      adminAuthHeaders
    )
    expect(styleRes.status).toEqual(201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      adminAuthHeaders
    )
    expect(breweryRes.status).toEqual(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemans Kriek', breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      adminAuthHeaders
    )

    expect(beerRes.status).toEqual(201)
    expect(beerRes.data.beer.name).toEqual('Lindemans Kriek')
    expect(beerRes.data.beer.breweries).toEqual([breweryRes.data.brewery.id])
    expect(beerRes.data.beer.styles).toEqual([styleRes.data.style.id])

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

  it('create a storage', async () => {
    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(ctx.adminAuthHeaders())

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      {
        bestBefore,
        beer: beerRes.data.beer.id,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(storageRes.status).toEqual(201)
    expect(storageRes.data.storage.bestBefore).toEqual(bestBefore)
    expect(storageRes.data.storage.beer).toEqual(beerRes.data.beer.id)
    expect(storageRes.data.storage.container).toEqual(containerRes.data.container.id)

    const getRes = await ctx.request.get<{ storage: JoinedStorage }>(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.storage.id).toEqual(storageRes.data.storage.id)
    expect(getRes.data.storage.bestBefore.toString()).toEqual(bestBefore)
    expect(getRes.data.storage.beerId).toEqual(beerRes.data.beer.id)
    expect(getRes.data.storage.container).toEqual(containerRes.data.container)

    const listRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      '/api/v1/storage/',
      ctx.adminAuthHeaders()
    )
    expect(listRes.status).toEqual(200)
    expect(listRes.data.storages.length).toEqual(1)
    expect(listRes.data.storages[0].id).toEqual(getRes.data.storage.id)
    expect(listRes.data.storages[0].beerId).toEqual(getRes.data.storage.beerId)
    expect(listRes.data.storages[0].container).toEqual(containerRes.data.container)
    expect(listRes.data.storages[0].breweries[0]).toEqual(breweryRes.data.brewery)
    const parentlessStyle = { ...styleRes.data.style }
    delete parentlessStyle.parents
    expect(listRes.data.storages[0].styles[0]).toEqual(parentlessStyle)

    const skippedListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      '/api/v1/storage?size=50&skip=30',
      ctx.adminAuthHeaders()
    )
    expect(skippedListRes.status).toEqual(200)
    expect(skippedListRes.data.storages.length).toEqual(0)

    const breweryListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    expect(breweryListRes.status).toEqual(200)
    expect(breweryListRes.data.storages.length).toEqual(1)
    expect(breweryListRes.data.storages[0].id).toEqual(getRes.data.storage.id)
    expect(breweryListRes.data.storages[0]).toEqual(getRes.data.storage)

    const styleListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/style/${styleRes.data.style.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    expect(styleListRes.status).toEqual(200)
    expect(styleListRes.data.storages.length).toEqual(1)
    expect(styleListRes.data.storages[0].id).toEqual(getRes.data.storage.id)
    expect(styleListRes.data.storages[0]).toEqual(getRes.data.storage)

    const beerListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/beer/${beerRes.data.beer.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    expect(beerListRes.status).toEqual(200)
    expect(beerListRes.data.storages).toEqual(breweryListRes.data.storages)
  })

  it('fail to create a storage without beer', async () => {
    const { containerRes } = await createDeps(ctx.adminAuthHeaders())

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      {
        bestBefore,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(storageRes.status).toEqual(400)
  })

  it('fail to create a storage with invalid beer', async () => {
    const { containerRes } = await createDeps(ctx.adminAuthHeaders())

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      {
        bestBefore,
        beer: 'df3d945c-b501-4ef1-8c51-2935fdba79ab',
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(storageRes.status).toEqual(400)
  })

  it('fail to create a storage without container', async () => {
    const { beerRes } = await createDeps(ctx.adminAuthHeaders())

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      {
        bestBefore,
        beer: beerRes.data.beer.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(storageRes.status).toEqual(400)
  })

  it('fail to create a storage with invalid container', async () => {
    const { beerRes } = await createDeps(ctx.adminAuthHeaders())

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      {
        bestBefore,
        beer: beerRes.data.beer.id,
        container: '233e9694-b69b-4347-8712-f6fcf27ec54f'
      },
      ctx.adminAuthHeaders()
    )
    expect(storageRes.status).toEqual(400)
  })

  it('update a storage', async () => {
    const { beerRes, containerRes } = await createDeps(ctx.adminAuthHeaders())

    const requestData = {
      bestBefore,
      beer: beerRes.data.beer.id,
      container: containerRes.data.container.id,
    }

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      requestData, ctx.adminAuthHeaders()
    )
    expect(storageRes.status).toEqual(201)

    const updateRes = await ctx.request.put(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      {
        ...requestData,
        bestBefore: bestBeforeLater
      },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).toEqual(200)

    const getRes = await ctx.request.get<{ storage: Storage }>(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.storage.bestBefore.toString()).toEqual(bestBeforeLater)
  })

  it('get empty storage list', async () => {
    const res = await ctx.request.get(`/api/v1/storage`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(200)
    expect(res.data.storages.length).toEqual(0)
  })

  async function createListByDeps(adminAuthHeaders: Record<string, unknown>) {
    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(adminAuthHeaders)

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      {
        beer: beerRes.data.beer.id,
        bestBefore: bestBeforeLater,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(storageRes.status).toEqual(201)
    expect(storageRes.data.storage.beer).toEqual(beerRes.data.beer.id)

    const otherStyleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(otherStyleRes.status).toEqual(201)

    const otherBreweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Nokian Panimo' },
      ctx.adminAuthHeaders()
    )
    expect(otherBreweryRes.status).toEqual(201)

    const otherBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'IPA', breweries: [otherBreweryRes.data.brewery.id], styles: [otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )

    expect(otherBeerRes.status).toEqual(201)
    expect(otherBeerRes.data.beer.name).toEqual('IPA')
    expect(otherBeerRes.data.beer.breweries).toEqual([otherBreweryRes.data.brewery.id])
    expect(otherBeerRes.data.beer.styles).toEqual([otherStyleRes.data.style.id])

    const otherStorageRes = await ctx.request.post(`/api/v1/storage`,
      {
        beer: otherBeerRes.data.beer.id,
        bestBefore,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(otherStorageRes.status).toEqual(201)
    expect(otherStorageRes.data.storage.beer).toEqual(otherBeerRes.data.beer.id)

    const collabBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Wild Kriek IPA', breweries: [breweryRes.data.brewery.id, otherBreweryRes.data.brewery.id], styles: [styleRes.data.style.id, otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )
    expect(collabBeerRes.status).toEqual(201)
    expect(collabBeerRes.data.beer.name).toEqual('Wild Kriek IPA')

    const collabStorageRes = await ctx.request.post(`/api/v1/storage`,
      {
        beer: collabBeerRes.data.beer.id,
        bestBefore,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    expect(collabStorageRes.status).toEqual(201)
    expect(collabStorageRes.data.storage.beer).toEqual(collabBeerRes.data.beer.id)

    return { beerRes, otherBeerRes, collabBeerRes, breweryRes, otherBreweryRes, styleRes, otherStyleRes, storageRes, otherStorageRes, collabStorageRes }
  }

  it('list storages by brewery', async () => {
    const { breweryRes, otherBreweryRes, storageRes, collabStorageRes } = await createListByDeps(ctx.adminAuthHeaders())

    const breweryListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    expect(breweryListRes.status).toEqual(200)
    expect(breweryListRes.data.storages.length).toEqual(2)
    const kriekStorage = breweryListRes.data.storages.find(storage => storage.id === storageRes.data.storage.id)
    if (kriekStorage === undefined) throw new Error('kriekStorage not found')
    expect(kriekStorage.id).toEqual(storageRes.data.storage.id)
    expect(kriekStorage.beerId).toEqual(storageRes.data.storage.beer)
    const collabStorage = breweryListRes.data.storages.find(storage => storage.id === collabStorageRes.data.storage.id)
    if (collabStorage === undefined) throw new Error('collabStorage not found')
    expect(collabStorage.id).toEqual(collabStorageRes.data.storage.id)
    expect(collabStorage.beerId).toEqual(collabStorageRes.data.storage.beer)
    expect(collabStorage.breweries?.length).toEqual(2)
    const collabBrewery = collabStorage?.breweries?.find(brewery => brewery.id === breweryRes.data.brewery.id);
    const otherCollabBrewery = collabStorage?.breweries?.find(brewery => brewery.id === otherBreweryRes.data.brewery.id);
    expect(collabBrewery).toEqual({ id: breweryRes.data.brewery.id, name: breweryRes.data.brewery.name });
    expect(otherCollabBrewery).toEqual({ id: otherBreweryRes.data.brewery.id, name: otherBreweryRes.data.brewery.name });

    const ids = breweryListRes.data.storages.map(storage => storage.id)
    expect(ids).toEqual([collabStorage?.id, kriekStorage.id])
  })

  it('list storages by style', async () => {
    const { styleRes, otherStyleRes, storageRes, collabStorageRes } = await createListByDeps(ctx.adminAuthHeaders())

    const styleListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/style/${styleRes.data.style.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    expect(styleListRes.status).toEqual(200)
    expect(styleListRes.data.storages.length).toEqual(2)
    const kriekStorage = styleListRes.data.storages.find(storage => storage.id === storageRes.data.storage.id)
    if (kriekStorage === undefined) throw new Error('kriekStorage not found')
    expect(kriekStorage.id).toEqual(storageRes.data.storage.id)
    expect(kriekStorage.beerId).toEqual(storageRes.data.storage.beer)
    const collabStorage = styleListRes.data.storages.find(storage => storage.id === collabStorageRes.data.storage.id)
    if (collabStorage === undefined) throw new Error('collabStorage not found')
    expect(collabStorage.id).toEqual(collabStorageRes.data.storage.id)
    expect(collabStorage.beerId).toEqual(collabStorageRes.data.storage.beer)
    expect(collabStorage.breweries?.length).toEqual(2)
    const collabStyle = collabStorage.styles?.find(style => style.id === styleRes.data.style.id);
    const otherCollabStyle = collabStorage.styles?.find(style => style.id === otherStyleRes.data.style.id);
    expect(collabStyle).toEqual({ id: styleRes.data.style.id, name: styleRes.data.style.name });
    expect(otherCollabStyle).toEqual({ id: otherStyleRes.data.style.id, name: otherStyleRes.data.style.name });

    const ids = styleListRes.data.storages.map(storage => storage.id)
    expect(ids).toEqual([collabStorage.id, kriekStorage.id])
  })
})
