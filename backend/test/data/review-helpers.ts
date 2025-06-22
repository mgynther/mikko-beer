import type { Beer } from '../../src/core/beer/beer'
import type { Brewery } from '../../src/core/brewery/brewery'
import type { Container } from '../../src/core/container/container'
import type { Location } from '../../src/core/location/location'
import type { Review } from '../../src/core/review/review'
import type { Style } from '../../src/core/style/style'
import type { Database, Transaction } from '../../src/data/database'
import * as beerRepository from '../../src/data/beer/beer.repository'
import * as breweryRepository from '../../src/data/brewery/brewery.repository'
import * as containerRepository from '../../src/data/container/container.repository'
import * as locationRepository from '../../src/data/location/location.repository'
import * as reviewRepository from '../../src/data/review/review.repository'
import * as styleRepository from '../../src/data/style/style.repository'

export interface InsertedData {
  beer: Beer
  otherBeer: Beer
  brewery: Brewery
  otherBrewery: Brewery
  container: Container,
  otherContainer: Container,
  location: Location,
  otherLocation: Location,
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
  await beerRepository.insertBeerBreweries(
    trx, [beerBreweryRequest, otherBeerBreweryRequest]
  )
  const beerStyleRequest = {
    beer: beer.id,
    style: style.id,
  }
  const otherBeerStyleRequest = {
    beer: otherBeer.id,
    style: otherStyle.id,
  }
  await beerRepository.insertBeerStyles(
    trx, [beerStyleRequest, otherBeerStyleRequest]
  )
  const containerRequest = {
    size: '0.50',
    type: 'bottle'
  }
  const container =
    await containerRepository.insertContainer(trx, containerRequest)
  const otherContainerRequest = {
    size: '0.44',
    type: 'can'
  }
  const otherContainer =
    await containerRepository.insertContainer(trx, otherContainerRequest)
  const locationRequest = {
    name: 'location'
  }
  const location =
    await locationRepository.insertLocation(trx, locationRequest)
  const otherLocationRequest = {
    name: 'other location'
  }
  const otherLocation =
    await locationRepository.insertLocation(trx, otherLocationRequest)
  return {
    beer,
    otherBeer,
    brewery,
    otherBrewery,
    container,
    otherContainer,
    location,
    otherLocation,
    style,
    otherStyle
  }
}

export async function insertMultipleReviews(
  count: number,
  db: Database
): Promise<{ reviews: Review[], data: InsertedData }> {
  const reviews: Review[] = []
  let data: InsertedData | undefined = undefined
  await db.executeReadWriteTransaction(async (trx: Transaction) => {
    data = await insertData(trx)
    const {
      beer,
      otherBeer,
      container,
      otherContainer,
      location,
      otherLocation
    } = data
    for (let i = 0; i < count; i++) {
      const reviewRequest = {
        additionalInfo: '',
        beer: (i % 2 === 0) ? otherBeer.id : beer.id,
        container: (i % 2 === 0) ? otherContainer.id : container.id,
        location: (i % 2 === 0) ? otherLocation.id : location.id,
        rating: (i % 7) + 4,
        time: new Date(`202${
          i % 2 === 0 ? 3 : 4
        }-0${
          (i % 3) + 2
        }-0${
          (i % 5) + 1
        }T18:00:00.000Z`),
        smell: "vanilla",
        taste: "chocolate"
      }
      reviews.push(await reviewRepository.insertReview(trx, reviewRequest))
    }
  })
  if (data === undefined) throw new Error('data must not be undefined');
  return { reviews, data }
}
