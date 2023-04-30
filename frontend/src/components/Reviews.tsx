import { useListBeersQuery } from '../store/beer/api'
import { type Beer } from '../store/beer/types'
import { useListBreweriesQuery } from '../store/brewery/api'
import { useListContainersQuery } from '../store/container/api'
import { useListStylesQuery } from '../store/style/api'
import { useListReviewsQuery } from '../store/review/api'
import { toBeerMap } from '../store/beer/util'
import { toBreweryMap } from '../store/brewery/util'
import { toContainerMap } from '../store/container/util'
import { toStyleMap } from '../store/style/util'
import { type Review as ReviewType } from '../store/review/types'
import { toString } from './util'

import LoadingIndicator from './LoadingIndicator'
import Review, { ReviewHeading, type ReviewProps } from './Review'

import './Review.css'

function Reviews (): JSX.Element {
  const { data: beerData, isLoading: areBeersLoading } = useListBeersQuery()
  const beerMap = toBeerMap(beerData)
  const { data: breweryData, isLoading: areBreweriesLoading } =
    useListBreweriesQuery()
  const breweryMap = toBreweryMap(breweryData)
  const { data: containerData, isLoading: areContainersLoading } =
    useListContainersQuery()
  const containerMap = toContainerMap(containerData)
  const { data: styleData, isLoading: areStylesLoading } =
    useListStylesQuery()
  const styleMap = toStyleMap(styleData)
  const { data: reviewData, isLoading: areReviewsLoading } =
    useListReviewsQuery()
  const isLoading = areBeersLoading ||
    areBreweriesLoading ||
    areContainersLoading ||
    areReviewsLoading ||
    areStylesLoading

  const reviewArray = reviewData?.reviews === undefined
    ? []
    : reviewData?.reviews
  const reviews = reviewArray
    .map((review: ReviewType) => {
      const beer: Beer = beerMap[review.beer]
      const container = containerMap[review.container]
      return {
        ...review,
        id: review.id,
        breweries: toString(beer.breweries.map(b => breweryMap[b]?.name ?? '')),
        beer: beer.name,
        container,
        styles: toString(beer.styles.map(s => styleMap[s]?.name ?? ''))
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
