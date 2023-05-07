import { useEffect, useState } from 'react'

import { useLazyListReviewsQuery } from '../store/review/api'
import { type JoinedReview } from '../store/review/types'

import ReviewList from './ReviewList'
import { infiniteScroll } from './util'

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

  return (
    <div>
      <h3>Reviews</h3>
      <ReviewList
        isLoading={isLoading}
        isTitleVisible={false}
        reviews={loadedReviews}
      />
    </div>
  )
}

export default Reviews
