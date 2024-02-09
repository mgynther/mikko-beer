import { type Database, type Transaction } from '../../src/data/database'
import * as beerRepository from '../../src/data/beer/beer.repository'
import { type BeerRow } from '../../src/data/beer/beer.table'
import * as breweryRepository from '../../src/data/brewery/brewery.repository'
import { type BreweryRow } from '../../src/data/brewery/brewery.table'
import * as containerRepository from '../../src/data/container/container.repository'
import { type ContainerRow } from '../../src/data/container/container.table'
import * as reviewRepository from '../../src/data/review/review.repository'
import * as styleRepository from '../../src/data/style/style.repository'
import { StyleRow } from '../../src/data/style/style.table'
import { ReviewRow } from '../../src/data/review/review.table'

export interface InsertedData {
  beer: BeerRow
  otherBeer: BeerRow
  brewery: BreweryRow
  otherBrewery: BreweryRow
  container: ContainerRow,
  style: StyleRow,
  otherStyle: StyleRow
}

export async function insertData(trx: Transaction): Promise<InsertedData> {
  const brewery =
    await breweryRepository.insertBrewery(trx, { name: 'Salama' })
  const otherBrewery =
    await breweryRepository.insertBrewery(trx, { name: 'Brewdog' })
  const style = await styleRepository.insertStyle(trx, { name: 'Helles' })
  const otherStyle = await styleRepository.insertStyle(trx, { name: 'Lager' })
  const beer = await beerRepository.insertBeer(trx, { name: 'Brainzilla' })
  const otherBeer =
    await beerRepository.insertBeer(trx, { name: 'Lost Lager' })
  const beerBreweryRequest = {
    beer: beer.beer_id,
    brewery: brewery.brewery_id
  }
  await beerRepository.insertBeerBrewery(trx, beerBreweryRequest)
  const otherBeerBreweryRequest = {
    beer: otherBeer.beer_id,
    brewery: otherBrewery.brewery_id
  }
  await beerRepository.insertBeerBrewery(trx, otherBeerBreweryRequest)
  const beerStyleRequest = {
    beer: beer.beer_id,
    style: style.style_id
  }
  await beerRepository.insertBeerStyle(trx, beerStyleRequest)
  const otherBeerStyleRequest = {
    beer: otherBeer.beer_id,
    style: otherStyle.style_id
  }
  await beerRepository.insertBeerStyle(trx, otherBeerStyleRequest)
  const containerRequest = {
    size: '0.50',
    type: 'bottle'
  }
  const container =
    await containerRepository.insertContainer(trx, containerRequest)
  return { beer, otherBeer, brewery, otherBrewery, container, style, otherStyle }
}

export async function insertMultipleReviews(
  count: number,
  db: Database
): Promise<{ reviews: ReviewRow[], data: InsertedData }> {
  const reviews: ReviewRow[] = []
  let data: InsertedData | undefined = undefined
  await db.executeTransaction(async (trx: Transaction) => {
    data = await insertData(trx)
    const { beer, otherBeer, container } = data
    for (let i = 0; i < count; i++) {
      const reviewRequest = {
        beer: (i % 2 === 0) ? otherBeer.beer_id : beer.beer_id,
        container: container.container_id,
        rating: (i % 7) + 4,
        time: new Date(`2024-0${(i % 3) + 2}-0${(i % 5) + 1}T18:00:00.000Z`),
        smell: "vanilla",
        taste: "chocolate"
      }
      reviews.push(await reviewRepository.insertReview(trx, reviewRequest))
    }
  })
  if (data === undefined) throw new Error('data must not be undefined');
  return { reviews, data }
}
