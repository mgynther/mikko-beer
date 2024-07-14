import { useEffect, useState } from 'react'

import { useListReviewsMutation } from '../../store/review/api'
import {
  type JoinedReview,
  type ReviewSorting,
  type ReviewSortingOrder
} from '../../core/review/types'
import { type ListDirection } from '../../core/types'

import { infiniteScroll } from '../util'

import ReviewList from './ReviewList'

import './Review.css'
import { type ReviewContainerIf } from '../../core/review/types'
import type { SelectStyleIf } from '../../core/style/types'
import type { GetLogin } from '../../core/login/types'

const pageSize = 20

interface Props {
  getLogin: GetLogin
  reviewContainerIf: ReviewContainerIf
  selectStyleIf: SelectStyleIf
}

function Reviews (props: Props): JSX.Element {
  const [order, doSetOrder] = useState<ReviewSortingOrder>('time')
  const [direction, doSetDirection] = useState<ListDirection>('desc')
  const [loadedReviews, setLoadedReviews] = useState<JoinedReview[]>([])
  const [trigger, { data: reviewData, isLoading, isUninitialized }] =
    useListReviewsMutation()

  function setOrder (order: ReviewSortingOrder): void {
    setLoadedReviews([])
    doSetOrder(order)
  }

  function setDirection (direction: ListDirection): void {
    setLoadedReviews([])
    doSetDirection(direction)
  }

  function setSorting (reviewSorting: ReviewSorting): void {
    if (reviewSorting.order !== order) {
      setOrder(reviewSorting.order)
    }
    if (reviewSorting.direction !== direction) {
      setDirection(reviewSorting.direction)
    }
  }

  const reviewArray = reviewData?.reviews === undefined
    ? []
    : [...reviewData.reviews]
  const hasMore = reviewArray.length > 0 || isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await trigger({
        pagination: {
          skip: loadedReviews.length,
          size: pageSize
        },
        sorting: { order, direction }
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
  }, [
    loadedReviews,
    setLoadedReviews,
    isLoading,
    hasMore,
    trigger,
    order,
    direction
  ])

  return (
    <div>
      <h3>Reviews</h3>
      <ReviewList
        getLogin={props.getLogin}
        reviewContainerIf={props.reviewContainerIf}
        selectStyleIf={props.selectStyleIf}
        isLoading={isLoading}
        isTitleVisible={false}
        reviews={loadedReviews}
        sorting={reviewData?.sorting}
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
