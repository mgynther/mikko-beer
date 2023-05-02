import { useEffect, useState } from 'react'

import { useLazyListReviewsQuery } from '../store/review/api'
import { type JoinedReview } from '../store/review/types'

import LoadingIndicator from './LoadingIndicator'
import Review, { ReviewHeading, type ReviewProps } from './Review'
import { infiniteScroll, toString } from './util'

import './Review.css'

const pageSize = 20

function Reviews (): JSX.Element {
  const [loadedReviews, setLoadedReviews] = useState<JoinedReview[]>([])
  const [trigger, { data: reviewData, isLoading, isUninitialized }] =
    useLazyListReviewsQuery()

  const reviewArray = reviewData?.reviews === undefined
    ? []
    : [...reviewData.reviews]
  const hasMore = reviewArray.length > 0 || isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await trigger({
        skip: loadedReviews.length,
        size: pageSize
      })
      if (result.data === undefined) return
      setLoadedReviews([...loadedReviews, ...result.data.reviews])
    }
    function checkLoad (): void {
      if (!isLoading && hasMore) {
        void loadMore()
      }
    }
    return infiniteScroll(checkLoad)
  }, [loadedReviews, setLoadedReviews, isLoading, hasMore, trigger])

  const reviews = loadedReviews
    .map((review) => {
      return {
        ...review,
        beer: review.beerName,
        breweries: toString(review.breweries.map(b => b.name).sort() ?? []),
        styles: toString(review.styles.map(s => s.name).sort() ?? [])
      }
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
