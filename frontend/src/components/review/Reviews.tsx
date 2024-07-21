import { useEffect, useState } from 'react'

import type {
  ListReviewsIf,
  JoinedReview,
  ReviewIf,
  ReviewSorting,
  ReviewSortingOrder
} from '../../core/review/types'
import type { SearchIf } from '../../core/search/types'
import type { ListDirection } from '../../core/types'

import { infiniteScroll } from '../util'

import ReviewList from './ReviewList'

import './Review.css'

const pageSize = 20

interface Props {
  listReviewsIf: ListReviewsIf
  reviewIf: ReviewIf
  searchIf: SearchIf
}

function Reviews (props: Props): JSX.Element {
  const [order, doSetOrder] = useState<ReviewSortingOrder>('time')
  const [direction, doSetDirection] = useState<ListDirection>('desc')
  const [loadedReviews, setLoadedReviews] = useState<JoinedReview[]>([])
  const { list, reviewList, isLoading, isUninitialized } =
    props.listReviewsIf.useList()

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
