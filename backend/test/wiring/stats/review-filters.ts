import type { CreatedOrUpdatedBeer } from '../../../src/web/beer/beer.js'
import type { CreatedOrUpdatedReview } from '../../../src/web/review/review.js'

export function reviewsByYear(
  reviews: CreatedOrUpdatedReview[],
  year: string,
): CreatedOrUpdatedReview[] {
  return reviews.filter((review: CreatedOrUpdatedReview) => {
    return review.time.startsWith(year)
  })
}

export function reviewsByBrewery(
  reviews: CreatedOrUpdatedReview[],
  beers: CreatedOrUpdatedBeer[],
  breweryId: string,
): CreatedOrUpdatedReview[] {
  return reviews.filter((review: CreatedOrUpdatedReview) => {
    const beerId = review.beer
    const beer = beers.find((beer) => beer.id === beerId)
    if (beer === undefined) {
      return false
    }
    return beer.breweries.includes(breweryId)
  })
}
