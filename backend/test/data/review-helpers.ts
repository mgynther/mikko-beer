import { type Beer } from '../../src/core/beer/beer'
import { type Brewery } from '../../src/core/brewery/brewery'
import { type Container } from '../../src/core/container/container'
import { type Review } from '../../src/core/review/review'
import { type Style } from '../../src/core/style/style'
import { type Database, type Transaction } from '../../src/data/database'
import * as beerRepository from '../../src/data/beer/beer.repository'
import * as breweryRepository from '../../src/data/brewery/brewery.repository'
import * as containerRepository from '../../src/data/container/container.repository'
import * as reviewRepository from '../../src/data/review/review.repository'
import * as styleRepository from '../../src/data/style/style.repository'

export interface InsertedData {
  beer: Beer
  otherBeer: Beer
  brewery: Brewery
  otherBrewery: Brewery
  container: Container,
  style: Style,
  otherStyle: Style
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
    beer: beer.id,
    brewery: brewery.id
  }
  const otherBeerBreweryRequest = {
    beer: otherBeer.id,
    brewery: otherBrewery.id
  }
  await beerRepository.insertBeerBreweries(trx, [beerBreweryRequest, otherBeerBreweryRequest])
  const beerStyleRequest = {
    beer: beer.id,
    style: style.id,
  }
  const otherBeerStyleRequest = {
    beer: otherBeer.id,
    style: otherStyle.id,
  }
  await beerRepository.insertBeerStyles(trx, [beerStyleRequest, otherBeerStyleRequest])
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
): Promise<{ reviews: Review[], data: InsertedData }> {
  const reviews: Review[] = []
  let data: InsertedData | undefined = undefined
  await db.executeTransaction(async (trx: Transaction) => {
    data = await insertData(trx)
    const { beer, otherBeer, container } = data
    for (let i = 0; i < count; i++) {
      const reviewRequest = {
        additionalInfo: '',
        beer: (i % 2 === 0) ? otherBeer.id : beer.id,
        container: container.id,
        location: '',
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
