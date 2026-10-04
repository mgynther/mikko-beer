import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { assertLockHoldsOffWrite } from '../lock.js'
import { TestContext } from '../test-context.js'
import type { Beer } from '../../../src/data/beer/beer.repository.js'
import type { Container } from '../../../src/data/container/container.repository.js'
import type {
  JoinedStorage,
  StorageWithDate,
} from '../../../src/data/storage/storage.repository.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as storageRepository from '../../../src/data/storage/storage.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import { assertDeepEqual, assertEqual, assertTruthy } from '../../assert.js'
import { buildNewBeer } from '../beer/builders.js'
import { buildNewBrewery } from '../brewery/builders.js'
import { buildNewContainer } from '../container/builders.js'
import { buildNewLocation } from '../location/builders.js'
import { buildNewReview } from '../review/builders.js'
import { buildNewStyle } from '../style/builders.js'

// A storage is listed only with a beer that has a brewery and a style, so
// every beer here gets one of each. Brewery and style names are unique, so
// the caller names them.
async function insertBeer(
  trx: Transaction,
  names: { brewery: string; style: string },
): Promise<Beer> {
  const [brewery, style, beer] = await Promise.all([
    breweryRepository.insertBrewery(
      trx,
      buildNewBrewery({ name: names.brewery }),
    ),
    styleRepository.insertStyle(trx, buildNewStyle({ name: names.style })),
    beerRepository.insertBeer(trx, buildNewBeer()),
  ])
  await Promise.all([
    beerRepository.insertBeerBreweries(trx, [
      { beer: beer.id, brewery: brewery.id },
    ]),
    beerRepository.insertBeerStyles(trx, [{ beer: beer.id, style: style.id }]),
  ])
  return beer
}

async function insertStorage(
  trx: Transaction,
  beer: Beer,
  container: Container,
  bestBefore: string,
): Promise<StorageWithDate> {
  return await storageRepository.insertStorage(trx, {
    beer: beer.id,
    bestBefore,
    container: container.id,
  })
}

type ShelvedBeer = 'kriek' | 'creamAle' | 'ipa'

// A storage as it is joined, apart from when it was created, which the
// database decides.
type JoinedWithoutCreation = Omit<JoinedStorage, 'createdAt'>

interface Shelf {
  breweries: { lindemans: string; nokian: string; sonnisaari: string }
  styles: { kriek: string; ale: string; lager: string }
  beers: Record<ShelvedBeer, string>
  storages: Record<ShelvedBeer, JoinedWithoutCreation>
}

// A Lindemans kriek, a cream ale that Nokian Panimo brews with Sonnisaari
// and that is both an ale and a lager, and a Nokian Panimo IPA, which is an
// ale. Their best before dates are in that order. The cream ale's breweries
// and styles are linked in reverse order of their names.
async function insertShelf(db: Database): Promise<Shelf> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const [lindemans, nokian, sonnisaari, kriekStyle, ale, lager, container] =
      await Promise.all([
        breweryRepository.insertBrewery(
          trx,
          buildNewBrewery({ name: 'Lindemans' }),
        ),
        breweryRepository.insertBrewery(
          trx,
          buildNewBrewery({ name: 'Nokian Panimo' }),
        ),
        breweryRepository.insertBrewery(
          trx,
          buildNewBrewery({ name: 'Sonnisaari' }),
        ),
        styleRepository.insertStyle(trx, buildNewStyle({ name: 'Kriek' })),
        styleRepository.insertStyle(trx, buildNewStyle({ name: 'Ale' })),
        styleRepository.insertStyle(trx, buildNewStyle({ name: 'Lager' })),
        containerRepository.insertContainer(trx, buildNewContainer()),
      ])

    async function insertShelvedBeer(
      name: string,
      breweries: Array<{ id: string; name: string }>,
      styles: Array<{ id: string; name: string }>,
      bestBefore: string,
    ): Promise<JoinedWithoutCreation> {
      const beer = await beerRepository.insertBeer(trx, buildNewBeer({ name }))
      await Promise.all([
        beerRepository.insertBeerBreweries(
          trx,
          breweries.map((brewery) => ({ beer: beer.id, brewery: brewery.id })),
        ),
        beerRepository.insertBeerStyles(
          trx,
          styles.map((style) => ({ beer: beer.id, style: style.id })),
        ),
      ])
      const storage = await insertStorage(trx, beer, container, bestBefore)
      return {
        id: storage.id,
        beerId: beer.id,
        beerName: beer.name,
        bestBefore: storage.bestBefore,
        breweries: byName(breweries).map(({ id, name }) => ({ id, name })),
        container,
        hasReview: false,
        styles: byName(styles).map(({ id, name }) => ({ id, name })),
      }
    }

    const [kriek, creamAle, ipa] = await Promise.all([
      insertShelvedBeer(
        'Kriek',
        [lindemans],
        [kriekStyle],
        '2024-10-01T00:00:00.000Z',
      ),
      insertShelvedBeer(
        'Cream Ale',
        [sonnisaari, nokian],
        [lager, ale],
        '2024-11-01T00:00:00.000Z',
      ),
      insertShelvedBeer('IPA', [nokian], [ale], '2024-12-01T00:00:00.000Z'),
    ])
    return {
      breweries: {
        lindemans: lindemans.id,
        nokian: nokian.id,
        sonnisaari: sonnisaari.id,
      },
      styles: { kriek: kriekStyle.id, ale: ale.id, lager: lager.id },
      beers: {
        kriek: kriek.beerId,
        creamAle: creamAle.beerId,
        ipa: ipa.beerId,
      },
      storages: { kriek, creamAle, ipa },
    }
  })
}

function byName<T extends { name: string }>(items: T[]): T[] {
  return items.toSorted((a: T, b: T) => a.name.localeCompare(b.name))
}

function withoutCreation(storage: JoinedStorage): JoinedWithoutCreation {
  const { createdAt, ...joined } = storage
  return joined
}

suite('storage tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createStorage(db: Database): Promise<StorageWithDate> {
    return await db.executeReadWriteTransaction(
      async (trx: Transaction): Promise<StorageWithDate> => {
        const [beer, container] = await Promise.all([
          insertBeer(trx, {
            brewery: 'Koskipanimo',
            style: 'Pils',
          }),
          containerRepository.insertContainer(trx, buildNewContainer()),
        ])
        return await insertStorage(
          trx,
          beer,
          container,
          '2024-12-02T12:12:12.000Z',
        )
      },
    )
  }

  test('lock storage that exists', async () => {
    const storage = await createStorage(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(trx, storage.id)
      assertEqual(lockedKey, storage.id)
    })
  })

  test('storage does not have review', async () => {
    const storage = await createStorage(ctx.db)
    const found = await storageRepository.findStorageById(ctx.db, storage.id)
    assertEqual(found?.hasReview, false)
  })

  test('storages have reviews', async () => {
    // The storages are listed by their best before dates: the kriek's
    // first, then the IPA's, then the lager's. The kriek is reviewed twice,
    // the IPA once and the lager not at all.
    const { kriek, ipa, lager } = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const [kriek, ipa, lager, container, location] = await Promise.all([
          insertBeer(trx, {
            brewery: 'Lindemans',
            style: 'Kriek',
          }),
          insertBeer(trx, {
            brewery: 'Nokian Panimo',
            style: 'IPA',
          }),
          insertBeer(trx, {
            brewery: 'Koskipanimo',
            style: 'Lager',
          }),
          containerRepository.insertContainer(trx, buildNewContainer()),
          locationRepository.insertLocation(trx, buildNewLocation()),
        ])
        await Promise.all([
          ...[kriek, kriek, ipa].map((beer) =>
            reviewRepository.insertReview(
              trx,
              buildNewReview({
                beer: beer.id,
                container: container.id,
                location: location.id,
              }),
            ),
          ),
          insertStorage(trx, lager, container, '2024-12-02T12:12:12.000Z'),
          insertStorage(trx, ipa, container, '2023-12-02T12:12:12.000Z'),
          insertStorage(trx, kriek, container, '2022-12-02T12:12:12.000Z'),
        ])
        return { kriek, ipa, lager }
      },
    )

    const results = await storageRepository.listStorages(ctx.db, {
      skip: 0,
      size: 20,
    })

    // Two reviews of the kriek still make one storage.
    assertDeepEqual(
      results.map(({ beerId, hasReview }) => ({ beerId, hasReview })),
      [
        { beerId: kriek.id, hasReview: true },
        { beerId: ipa.id, hasReview: true },
        { beerId: lager.id, hasReview: false },
      ],
    )
  })

  test('delete storage', async () => {
    const storage = await createStorage(ctx.db)
    const createdStorage = await storageRepository.findStorageById(
      ctx.db,
      storage.id,
    )
    assertTruthy(createdStorage)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await storageRepository.deleteStorageById(trx, storage.id)
    })
    const deletedStorage = await storageRepository.findStorageById(
      ctx.db,
      storage.id,
    )
    assertEqual(deletedStorage, undefined)
  })

  test('update storage', async () => {
    const storage = await createStorage(ctx.db)
    const { container, updated } = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const container = await containerRepository.insertContainer(
          trx,
          buildNewContainer({ type: 'can', size: '0.50' }),
        )
        const updated = await storageRepository.updateStorage(trx, {
          id: storage.id,
          bestBefore: '2025-03-01T12:00:00.000Z',
          beer: storage.beer,
          container: container.id,
        })
        return { container, updated }
      },
    )
    assertDeepEqual(updated, {
      id: storage.id,
      bestBefore: new Date('2025-03-01T12:00:00.000Z'),
      beer: storage.beer,
      container: container.id,
    })
  })

  test('update storage that does not exist', async () => {
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await storageRepository.updateStorage(trx, {
          id: '6b3e0d9c-4a7f-4c1e-8d2b-5f9a3e7c0d16',
          bestBefore: '2025-03-01T12:00:00.000Z',
          beer: '8c2f5a0d-3e6b-4d9a-b1c7-0e4f8a2d6b35',
          container: '1d6a9e3c-5f2b-4a8d-9c0e-7b3f1a5d8e42',
        }),
    )
    assertEqual(updated, undefined)
  })

  test('do not lock storage that does not exists', async () => {
    const dummyId = 'a3386d9d-cf3f-4ae9-9101-493a117a5458'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(trx, dummyId)
      assertEqual(lockedKey, undefined)
    })
  })

  // Two storages in December 2022, two in November 2023 and one in
  // December 2023, listed out of order.
  async function createStatsData(db: Database): Promise<void> {
    await db.executeReadWriteTransaction(async (trx: Transaction) => {
      const [beer, container] = await Promise.all([
        insertBeer(trx, {
          brewery: 'Koskipanimo',
          style: 'Pils',
        }),
        containerRepository.insertContainer(trx, buildNewContainer()),
      ])
      await Promise.all(
        [
          '2023-12-02T12:12:12.000Z',
          '2022-12-02T12:12:12.000Z',
          '2022-12-02T12:12:12.000Z',
          '2023-11-02T12:12:12.000Z',
          '2023-11-02T12:12:12.000Z',
        ].map((bestBefore) => insertStorage(trx, beer, container, bestBefore)),
      )
    })
  }

  test('annual storage stats', async () => {
    await createStatsData(ctx.db)
    const results = await storageRepository.getAnnualStorageStats(ctx.db)
    assertDeepEqual(results, [
      {
        year: '2022',
        count: '2',
      },
      {
        year: '2023',
        count: '3',
      },
    ])
  })

  test('monthly storage stats', async () => {
    await createStatsData(ctx.db)
    const results = await storageRepository.getMonthlyStorageStats(ctx.db)
    assertDeepEqual(results, [
      {
        year: '2022',
        month: '12',
        count: '2',
      },
      {
        year: '2023',
        month: '11',
        count: '2',
      },
      {
        year: '2023',
        month: '12',
        count: '1',
      },
    ])
  })
  test('find storage by id with what it joins', async () => {
    const shelf = await insertShelf(ctx.db)
    const found = await storageRepository.findStorageById(
      ctx.db,
      shelf.storages.creamAle.id,
    )
    assertDeepEqual(found && withoutCreation(found), shelf.storages.creamAle)
  })

  // The page is cut from the same order it is listed in, so a page of the
  // three skips the earliest.
  test('list a page of storages, earliest best before first', async () => {
    const shelf = await insertShelf(ctx.db)
    const storages = await storageRepository.listStorages(ctx.db, {
      size: 2,
      skip: 1,
    })
    assertDeepEqual(storages.map(withoutCreation), [
      shelf.storages.creamAle,
      shelf.storages.ipa,
    ])
  })

  const lists: Array<{
    listing: string
    list: (shelf: Shelf) => Promise<JoinedStorage[]>
    expected: ShelvedBeer[]
  }> = [
    {
      listing: 'list storages',
      list: async () =>
        await storageRepository.listStorages(ctx.db, { size: 20, skip: 0 }),
      expected: ['kriek', 'creamAle', 'ipa'],
    },
    {
      listing: 'list storages by beer',
      list: async (shelf) =>
        await storageRepository.listStoragesByBeer(
          ctx.db,
          shelf.beers.creamAle,
        ),
      expected: ['creamAle'],
    },
    // Listed by one of its breweries, the cream ale still has both.
    {
      listing: 'list storages by brewery',
      list: async (shelf) =>
        await storageRepository.listStoragesByBrewery(
          ctx.db,
          shelf.breweries.nokian,
        ),
      expected: ['creamAle', 'ipa'],
    },
    // Listed by one of its styles, the cream ale still has both.
    {
      listing: 'list storages by style',
      list: async (shelf) =>
        await storageRepository.listStoragesByStyle(ctx.db, shelf.styles.ale),
      expected: ['creamAle', 'ipa'],
    },
  ]

  lists.forEach(({ listing, list, expected }) => {
    const title = `${listing}, earliest best before first, with what each joins`
    test(title, async () => {
      const shelf = await insertShelf(ctx.db)
      const storages = await list(shelf)
      assertDeepEqual(
        storages.map(withoutCreation),
        expected.map((beer) => shelf.storages[beer]),
      )
    })
  })
  interface Cellar {
    brewery: string
    style: string
    beers: Record<string, string>
    storages: StorageWithDate[]
  }

  // Koskipanimo lagers stored with the same best before date, one storage
  // for each name given and one beer for each distinct name.
  async function insertCellar(storedBeers: string[]): Promise<Cellar> {
    return await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const [brewery, style, container] = await Promise.all([
          breweryRepository.insertBrewery(
            trx,
            buildNewBrewery({ name: 'Koskipanimo' }),
          ),
          styleRepository.insertStyle(trx, buildNewStyle({ name: 'Lager' })),
          containerRepository.insertContainer(trx, buildNewContainer()),
        ])
        const names = [...new Set(storedBeers)]
        const beers = await Promise.all(
          names.map(
            async (name: string) =>
              await beerRepository.insertBeer(trx, buildNewBeer({ name })),
          ),
        )
        await Promise.all([
          beerRepository.insertBeerBreweries(
            trx,
            beers.map((beer: Beer) => ({ beer: beer.id, brewery: brewery.id })),
          ),
          beerRepository.insertBeerStyles(
            trx,
            beers.map((beer: Beer) => ({ beer: beer.id, style: style.id })),
          ),
        ])
        const beerIds: Record<string, string> = Object.fromEntries(
          beers.map((beer: Beer) => [beer.name, beer.id]),
        )
        const storages = await Promise.all(
          storedBeers.map(
            async (name: string) =>
              await storageRepository.insertStorage(trx, {
                beer: beerIds[name],
                bestBefore: '2025-06-01T00:00:00.000Z',
                container: container.id,
              }),
          ),
        )
        return {
          brewery: brewery.id,
          style: style.id,
          beers: beerIds,
          storages,
        }
      },
    )
  }

  const cellarLists: Array<{
    listing: string
    list: (cellar: Cellar) => Promise<JoinedStorage[]>
  }> = [
    {
      listing: 'list storages',
      list: async () =>
        await storageRepository.listStorages(ctx.db, { size: 20, skip: 0 }),
    },
    {
      listing: 'list storages by brewery',
      list: async (cellar) =>
        await storageRepository.listStoragesByBrewery(ctx.db, cellar.brewery),
    },
    {
      listing: 'list storages by style',
      list: async (cellar) =>
        await storageRepository.listStoragesByStyle(ctx.db, cellar.style),
    },
  ]

  cellarLists.forEach(({ listing, list }) => {
    test(`${listing} of the same best before by beer name`, async () => {
      const cellar = await insertCellar(['Weizenbock', 'Helles'])
      const storages = await list(cellar)
      assertDeepEqual(
        storages.map((storage: JoinedStorage) => storage.beerName),
        ['Helles', 'Weizenbock'],
      )
    })
  })

  const sameBeerLists = [
    ...cellarLists,
    {
      listing: 'list storages by beer',
      list: async (cellar: Cellar) =>
        await storageRepository.listStoragesByBeer(ctx.db, cellar.beers.Helles),
    },
  ]

  sameBeerLists.forEach(({ listing, list }) => {
    test(`${listing} of the same beer and best before by id`, async () => {
      const cellar = await insertCellar(['Helles', 'Helles', 'Helles'])
      const storages = await list(cellar)
      assertDeepEqual(
        storages.map((storage: JoinedStorage) => storage.id),
        cellar.storages
          .map((storage: StorageWithDate) => storage.id)
          .toSorted(),
      )
    })
  })

  test('page storages of the same beer and best before by id', async () => {
    const cellar = await insertCellar(['Helles', 'Helles', 'Helles'])
    const pages = [
      await storageRepository.listStorages(ctx.db, { size: 1, skip: 0 }),
      await storageRepository.listStorages(ctx.db, { size: 1, skip: 1 }),
      await storageRepository.listStorages(ctx.db, { size: 1, skip: 2 }),
    ]
    assertDeepEqual(
      pages.map((page: JoinedStorage[]) =>
        page.map((storage: JoinedStorage) => storage.id),
      ),
      cellar.storages
        .map((storage: StorageWithDate) => storage.id)
        .toSorted()
        .map((id: string) => [id]),
    )
  })

  test('do not list storages when there are none', async () => {
    const storages = await storageRepository.listStorages(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(storages, [])
  })

  test('update the given storage only', async () => {
    const cellar = await insertCellar(['Helles', 'Helles'])
    const [updated, untouched] = cellar.storages
    await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await storageRepository.updateStorage(trx, {
          id: updated.id,
          bestBefore: '2026-06-01T00:00:00.000Z',
          beer: updated.beer,
          container: updated.container,
        }),
    )
    const found = await storageRepository.findStorageById(ctx.db, untouched.id)
    assertDeepEqual(found?.bestBefore, untouched.bestBefore)
  })

  test('delete the given storage only', async () => {
    const cellar = await insertCellar(['Helles', 'Helles'])
    const [deleted, kept] = cellar.storages
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await storageRepository.deleteStorageById(trx, deleted.id)
    })
    const storages = await storageRepository.listStorages(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(
      storages.map((storage: JoinedStorage) => storage.id),
      [kept.id],
    )
  })

  test('keep a locked storage from being updated until the transaction ends', async () => {
    const storage = await createStorage(ctx.db)
    await assertLockHoldsOffWrite(
      ctx.db,
      async (trx: Transaction) =>
        await storageRepository.lockStorage(trx, storage.id),
      async (trx: Transaction) =>
        await storageRepository.updateStorage(trx, {
          id: storage.id,
          bestBefore: '2026-06-01T00:00:00.000Z',
          beer: storage.beer,
          container: storage.container,
        }),
    )
  })
})
