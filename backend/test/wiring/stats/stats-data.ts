import type { Client, RequestHeaders } from '../../client.js'
import type { CreatedOrUpdatedBeer } from '../../../src/web/beer/beer.js'
import type { CreatedOrUpdatedBrewery } from '../../../src/web/brewery/brewery.js'
import type { CreatedOrUpdatedContainer } from '../../../src/web/container/container.js'
import type { CreatedOrUpdatedLocation } from '../../../src/web/location/location.js'
import type { CreatedOrUpdatedReview } from '../../../src/web/review/review.js'
import type { CreatedOrUpdatedStyle } from '../../../src/web/style/style.js'
import { assertEqual } from '../../assert.js'

interface StatsData {
  lindemans: CreatedOrUpdatedBrewery
  nokian: CreatedOrUpdatedBrewery
  kriek: CreatedOrUpdatedStyle
  ipa: CreatedOrUpdatedStyle
  kuja: CreatedOrUpdatedLocation
  oluthuone: CreatedOrUpdatedLocation
  container: CreatedOrUpdatedContainer
}

// Lindemans, a Belgian brewery, brews a kriek, which is reviewed at Kuja in
// 2023 and rated 8, and at Oluthuone in 2024 and rated 7. Nokian Panimo, a
// Finnish one, brews an IPA, which is reviewed at Oluthuone in 2024 and
// rated 6. Each is drunk from the same bottle.
export async function createStatsData(
  request: Client,
  headers: RequestHeaders,
): Promise<StatsData> {
  async function create<T>(path: string, body: object): Promise<T> {
    const res = await request.post<Record<string, T>>(
      `/api/v1/${path}`,
      body,
      headers,
    )
    assertEqual(res.status, 201)
    return res.data[path]
  }

  const [lindemans, nokian, kriek, ipa, kuja, oluthuone, container] =
    await Promise.all([
      create<CreatedOrUpdatedBrewery>('brewery', {
        name: 'Lindemans',
        country: 'BE',
      }),
      create<CreatedOrUpdatedBrewery>('brewery', {
        name: 'Nokian Panimo',
        country: 'FI',
      }),
      create<CreatedOrUpdatedStyle>('style', { name: 'Kriek', parents: [] }),
      create<CreatedOrUpdatedStyle>('style', { name: 'IPA', parents: [] }),
      create<CreatedOrUpdatedLocation>('location', { name: 'Kuja' }),
      create<CreatedOrUpdatedLocation>('location', { name: 'Oluthuone' }),
      create<CreatedOrUpdatedContainer>('container', {
        type: 'Bottle',
        size: '0.33',
      }),
    ])
  const [lindemansKriek, nokianIpa] = await Promise.all([
    create<CreatedOrUpdatedBeer>('beer', {
      name: 'Lindemans Kriek',
      breweries: [lindemans.id],
      styles: [kriek.id],
    }),
    create<CreatedOrUpdatedBeer>('beer', {
      name: 'Nokian IPA',
      breweries: [nokian.id],
      styles: [ipa.id],
    }),
  ])
  await Promise.all(
    [
      { beer: lindemansKriek, location: kuja, rating: 8, time: '2023-03-07' },
      {
        beer: lindemansKriek,
        location: oluthuone,
        rating: 7,
        time: '2024-05-01',
      },
      { beer: nokianIpa, location: oluthuone, rating: 6, time: '2024-06-01' },
    ].map(({ beer, location, rating, time }) =>
      create<CreatedOrUpdatedReview>('review', {
        additionalInfo: '',
        beer: beer.id,
        container: container.id,
        location: location.id,
        rating,
        smell: 'Fruity',
        taste: 'Fresh',
        time: `${time}T18:00:00.000Z`,
      }),
    ),
  )
  return { lindemans, nokian, kriek, ipa, kuja, oluthuone, container }
}
