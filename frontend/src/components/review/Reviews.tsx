import React, { useEffect, useState } from 'react'

import type {
  ListReviewsIf,
  JoinedReview,
  ReviewIf,
  ReviewSorting,
  ReviewSortingOrder
} from '../../core/review/types'
import type { SearchIf } from '../../core/search/types'
import type { ListDirection } from '../../core/types'

import ReviewList from './ReviewList'

import './Review.css'

const pageSize = 20

interface Props {
  listReviewsIf: ListReviewsIf
  reviewIf: ReviewIf
  searchIf: SearchIf
}

function Reviews (props: Props): React.JSX.Element {
  const [order, setOrder] = useState<ReviewSortingOrder>('time')
  const [direction, setDirection] = useState<ListDirection>('desc')
  const [loadedReviews, setLoadedReviews] = useState<JoinedReview[]>([])
  const { list, reviewList, isLoading, isUninitialized } =
    props.listReviewsIf.useList()

  function setSorting (reviewSorting: ReviewSorting): void {
    setOrder(reviewSorting.order)
    setDirection(reviewSorting.direction)
  }

  const reloadString = JSON.stringify({
    direction,
    order
  })
  useEffect(() => {
    setLoadedReviews([])
  }, [reloadString])

  const reviewArray = reviewList === undefined
    ? []
    : [...reviewList.reviews]
  const hasMore = reviewArray.length > 0 || isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await list({
        pagination: {
          skip: loadedReviews.length,
          size: pageSize
        },
        sorting: { order, direction }
      })
      setLoadedReviews([...loadedReviews, ...result.reviews])
    }
    function checkLoad (): void {
      if (isLoading) {
        return
      }
      if (!hasMore) {
        return
      }
      void loadMore()
    }
    return props.listReviewsIf.infiniteScroll(checkLoad)
  }, [
    isLoading,
    hasMore,
    list,
    order,
    direction
  ])

  return (
    <div>
      <h3>Reviews</h3>
      <ReviewList
        reviewIf={props.reviewIf}
        isLoading={isLoading}
        isTitleVisible={false}
        reviews={loadedReviews}
        searchIf={props.searchIf}
        sorting={reviewList?.sorting}
        setSorting={setSorting}
        supportedSorting={['rating', 'time']}
        onChanged={() => {
          setLoadedReviews([])
        }}
      />
    </div>
  )
}

export default Reviews
