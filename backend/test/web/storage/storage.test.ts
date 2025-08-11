import { describe, it, before, beforeEach, after, afterEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { TestContext } from '../test-context'
import { JoinedStorage, Storage } from '../../../src/core/storage/storage'
import { assertDeepEqual } from '../../assert'

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
    assert.equal(styleRes.status, 201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      adminAuthHeaders
    )
    assert.equal(breweryRes.status, 201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemans Kriek', breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      adminAuthHeaders
    )

    assert.equal(beerRes.status, 201)
    assert.equal(beerRes.data.beer.name, 'Lindemans Kriek')
    assertDeepEqual(beerRes.data.beer.breweries, [breweryRes.data.brewery.id])
    assertDeepEqual(beerRes.data.beer.styles, [styleRes.data.style.id])

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
    assert.equal(storageRes.status, 201)
    assert.equal(storageRes.data.storage.bestBefore, bestBefore)
    assert.equal(storageRes.data.storage.beer, beerRes.data.beer.id)
    assert.equal(storageRes.data.storage.container, containerRes.data.container.id)

    const getRes = await ctx.request.get<{ storage: JoinedStorage }>(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      ctx.adminAuthHeaders()
    )

    assert.equal(getRes.status, 200)
    assert.equal(getRes.data.storage.id, storageRes.data.storage.id)
    assert.equal(getRes.data.storage.bestBefore.toString(), bestBefore)
    assert.equal(getRes.data.storage.beerId, beerRes.data.beer.id)
    assertDeepEqual(getRes.data.storage.container, containerRes.data.container)

    const listRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      '/api/v1/storage/',
      ctx.adminAuthHeaders()
    )
    assert.equal(listRes.status, 200)
    assert.equal(listRes.data.storages.length, 1)
    assert.equal(listRes.data.storages[0].id, getRes.data.storage.id)
    assert.equal(listRes.data.storages[0].beerId, getRes.data.storage.beerId)
    assertDeepEqual(listRes.data.storages[0].container, containerRes.data.container)
    assertDeepEqual(listRes.data.storages[0].breweries[0], breweryRes.data.brewery)
    const parentlessStyle = { ...styleRes.data.style }
    delete parentlessStyle.parents
    assertDeepEqual(listRes.data.storages[0].styles[0], parentlessStyle)

    const skippedListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      '/api/v1/storage?size=50&skip=30',
      ctx.adminAuthHeaders()
    )
    assert.equal(skippedListRes.status, 200)
    assert.equal(skippedListRes.data.storages.length, 0)

    const breweryListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    assert.equal(breweryListRes.status, 200)
    assert.equal(breweryListRes.data.storages.length, 1)
    assert.equal(breweryListRes.data.storages[0].id, getRes.data.storage.id)
    assertDeepEqual(breweryListRes.data.storages[0], getRes.data.storage)

    const styleListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/style/${styleRes.data.style.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    assert.equal(styleListRes.status, 200)
    assert.equal(styleListRes.data.storages.length, 1)
    assert.equal(styleListRes.data.storages[0].id, getRes.data.storage.id)
    assertDeepEqual(styleListRes.data.storages[0], getRes.data.storage)

    const beerListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/beer/${beerRes.data.beer.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    assert.equal(beerListRes.status, 200)
    assertDeepEqual(beerListRes.data.storages, breweryListRes.data.storages)
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
    assert.equal(storageRes.status, 400)
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
    assert.equal(storageRes.status, 400)
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
    assert.equal(storageRes.status, 400)
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
    assert.equal(storageRes.status, 400)
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
    assert.equal(storageRes.status, 201)

    const updateRes = await ctx.request.put(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      {
        ...requestData,
        bestBefore: bestBeforeLater
      },
      ctx.adminAuthHeaders()
    )
    assert.equal(updateRes.status, 200)

    const getRes = await ctx.request.get<{ storage: Storage }>(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      ctx.adminAuthHeaders()
    )

    assert.equal(getRes.status, 200)
    assert.equal(getRes.data.storage.bestBefore.toString(), bestBeforeLater)
  })

  it('delete a storage', async () => {
    const { beerRes, containerRes } = await createDeps(ctx.adminAuthHeaders())

    const requestData = {
      bestBefore,
      beer: beerRes.data.beer.id,
      container: containerRes.data.container.id,
    }

    const storageRes = await ctx.request.post(`/api/v1/storage`,
      requestData, ctx.adminAuthHeaders()
    )
    assert.equal(storageRes.status, 201)
    const storageId = storageRes.data.storage.id

    const deleteRes = await ctx.request.delete(
      `/api/v1/storage/${storageId}`,
      ctx.adminAuthHeaders()
    )
    assert.equal(deleteRes.status, 204)

    const getRes = await ctx.request.get<{ storage: Storage }>(
      `/api/v1/storage/${storageId}`,
      ctx.adminAuthHeaders()
    )
    assert.equal(getRes.status, 404)
  })

  it('get empty storage list', async () => {
    const res = await ctx.request.get(`/api/v1/storage`,
      ctx.adminAuthHeaders()
    )

    assert.equal(res.status, 200)
    assert.equal(res.data.storages.length, 0)
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
    assert.equal(storageRes.status, 201)
    assert.equal(storageRes.data.storage.beer, beerRes.data.beer.id)

    const otherStyleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    assert.equal(otherStyleRes.status, 201)

    const otherBreweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Nokian Panimo' },
      ctx.adminAuthHeaders()
    )
    assert.equal(otherBreweryRes.status, 201)

    const otherBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'IPA', breweries: [otherBreweryRes.data.brewery.id], styles: [otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )

    assert.equal(otherBeerRes.status, 201)
    assert.equal(otherBeerRes.data.beer.name, 'IPA')
    assertDeepEqual(otherBeerRes.data.beer.breweries, [otherBreweryRes.data.brewery.id])
    assertDeepEqual(otherBeerRes.data.beer.styles, [otherStyleRes.data.style.id])

    const otherStorageRes = await ctx.request.post(`/api/v1/storage`,
      {
        beer: otherBeerRes.data.beer.id,
        bestBefore,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    assert.equal(otherStorageRes.status, 201)
    assert.equal(otherStorageRes.data.storage.beer, otherBeerRes.data.beer.id)

    const collabBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Wild Kriek IPA', breweries: [breweryRes.data.brewery.id, otherBreweryRes.data.brewery.id], styles: [styleRes.data.style.id, otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )
    assert.equal(collabBeerRes.status, 201)
    assert.equal(collabBeerRes.data.beer.name, 'Wild Kriek IPA')

    const collabStorageRes = await ctx.request.post(`/api/v1/storage`,
      {
        beer: collabBeerRes.data.beer.id,
        bestBefore,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    assert.equal(collabStorageRes.status, 201)
    assert.equal(collabStorageRes.data.storage.beer, collabBeerRes.data.beer.id)

    return { beerRes, otherBeerRes, collabBeerRes, breweryRes, otherBreweryRes, styleRes, otherStyleRes, storageRes, otherStorageRes, collabStorageRes }
  }

  it('list storages by brewery', async () => {
    const { breweryRes, otherBreweryRes, storageRes, collabStorageRes } = await createListByDeps(ctx.adminAuthHeaders())

    const breweryListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    assert.equal(breweryListRes.status, 200)
    assert.equal(breweryListRes.data.storages.length, 2)
    const kriekStorage = breweryListRes.data.storages.find(storage => storage.id === storageRes.data.storage.id)
    if (kriekStorage === undefined) throw new Error('kriekStorage not found')
    assert.equal(kriekStorage.id, storageRes.data.storage.id)
    assert.equal(kriekStorage.beerId, storageRes.data.storage.beer)
    assert.equal(kriekStorage.hasReview, false)
    const collabStorage = breweryListRes.data.storages.find(storage => storage.id === collabStorageRes.data.storage.id)
    if (collabStorage === undefined) throw new Error('collabStorage not found')
    assert.equal(collabStorage.id, collabStorageRes.data.storage.id)
    assert.equal(collabStorage.beerId, collabStorageRes.data.storage.beer)
    assert.equal(collabStorage.breweries?.length, 2)
    assert.equal(collabStorage.hasReview, false)
    const collabBrewery = collabStorage?.breweries?.find(brewery => brewery.id === breweryRes.data.brewery.id);
    const otherCollabBrewery = collabStorage?.breweries?.find(brewery => brewery.id === otherBreweryRes.data.brewery.id);
    assertDeepEqual(collabBrewery, { id: breweryRes.data.brewery.id, name: breweryRes.data.brewery.name });
    assertDeepEqual(otherCollabBrewery, { id: otherBreweryRes.data.brewery.id, name: otherBreweryRes.data.brewery.name });

    const ids = breweryListRes.data.storages.map(storage => storage.id)
    assertDeepEqual(ids, [collabStorage?.id, kriekStorage.id])
  })

  it('list storages by style', async () => {
    const { styleRes, otherStyleRes, storageRes, collabStorageRes } = await createListByDeps(ctx.adminAuthHeaders())

    const styleListRes = await ctx.request.get<{ storages: JoinedStorage[] }>(
      `/api/v1/style/${styleRes.data.style.id}/storage/`,
      ctx.adminAuthHeaders()
    )
    assert.equal(styleListRes.status, 200)
    assert.equal(styleListRes.data.storages.length, 2)
    const kriekStorage = styleListRes.data.storages.find(storage => storage.id === storageRes.data.storage.id)
    if (kriekStorage === undefined) throw new Error('kriekStorage not found')
    assert.equal(kriekStorage.id, storageRes.data.storage.id)
    assert.equal(kriekStorage.beerId, storageRes.data.storage.beer)
    assert.equal(kriekStorage.hasReview, false)
    const collabStorage = styleListRes.data.storages.find(storage => storage.id === collabStorageRes.data.storage.id)
    if (collabStorage === undefined) throw new Error('collabStorage not found')
    assert.equal(collabStorage.id, collabStorageRes.data.storage.id)
    assert.equal(collabStorage.beerId, collabStorageRes.data.storage.beer)
    assert.equal(collabStorage.breweries?.length, 2)
    assert.equal(collabStorage.hasReview, false)
    const collabStyle = collabStorage.styles?.find(style => style.id === styleRes.data.style.id);
    const otherCollabStyle = collabStorage.styles?.find(style => style.id === otherStyleRes.data.style.id);
    assertDeepEqual(collabStyle, { id: styleRes.data.style.id, name: styleRes.data.style.name });
    assertDeepEqual(otherCollabStyle, { id: otherStyleRes.data.style.id, name: otherStyleRes.data.style.name });

    const ids = styleListRes.data.storages.map(storage => storage.id)
    assertDeepEqual(ids, [collabStorage.id, kriekStorage.id])
  })
})
