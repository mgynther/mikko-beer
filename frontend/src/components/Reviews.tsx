import { useListBeersQuery } from '../store/beer/api'
import { type Beer } from '../store/beer/types'
import { useListContainersQuery } from '../store/container/api'
import { useListReviewsQuery } from '../store/review/api'
import { toBeerMap } from '../store/beer/util'
import { toContainerMap } from '../store/container/util'
import { type Review as ReviewType } from '../store/review/types'
import { toString } from './util'

import LoadingIndicator from './LoadingIndicator'
import Review, { ReviewHeading, type ReviewProps } from './Review'

import './Review.css'

function Reviews (): JSX.Element {
  const { data: beerData, isLoading: areBeersLoading } =
    useListBeersQuery({ size: 10000, skip: 0 })
  const beerMap = toBeerMap(beerData)
  const { data: containerData, isLoading: areContainersLoading } =
    useListContainersQuery()
  const containerMap = toContainerMap(containerData)
  const { data: reviewData, isLoading: areReviewsLoading } =
    useListReviewsQuery()
  const isLoading = areBeersLoading ||
    areContainersLoading ||
    areReviewsLoading

  const reviewArray = reviewData?.reviews === undefined
    ? []
    : reviewData?.reviews
  const reviews = reviewArray
    .map((review: ReviewType) => {
      const beer: Beer | undefined = beerMap[review.beer]
      const container = containerMap[review.container]
      return {
        ...review,
        id: review.id,
        breweries: toString(beer?.breweries.map(b => b.name).sort() ?? []),
        beer: beer?.name ?? '',
        container,
        styles: toString(beer?.styles.map(s => s.name).sort() ?? [])
      }
    })
    .sort((a: ReviewProps, b: ReviewProps) => {
      if (a.breweries === b.breweries) {
        return a.beer.localeCompare(b.beer)
      }
      return a.breweries.localeCompare(b.breweries)
    })

  return (
    <div>
      <h3>Reviews</h3>
      <LoadingIndicator isLoading={isLoading} />
      <div className="Review-content">
        <ReviewHeading />
        <div>
          {reviews.map((review: ReviewProps) => {
            return (
              <Review key={review.id} {...review} />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Reviews
