import { useEffect, useState } from 'react'

import { useListReviewsMutation } from '../../store/review/api'
import { type JoinedReview } from '../../store/review/types'

import { infiniteScroll } from '../util'

import ReviewList from './ReviewList'

import './Review.css'

const pageSize = 20

function Reviews (): JSX.Element {
  const [loadedReviews, setLoadedReviews] = useState<JoinedReview[]>([])
  const [trigger, { data: reviewData, isLoading, isUninitialized }] =
    useListReviewsMutation()

  const reviewArray = reviewData?.reviews === undefined
    ? []
    : [...reviewData.reviews]
  const hasMore = reviewArray.length > 0 || isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await trigger({
        skip: loadedReviews.length,
        size: pageSize
      }).unwrap()
      if (result === undefined) return
      setLoadedReviews([...loadedReviews, ...result.reviews])
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
        onChanged={() => {
          setLoadedReviews([])
        }}
      />
    </div>
  )
}

export default Reviews
