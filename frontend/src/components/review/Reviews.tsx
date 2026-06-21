import React, { useEffect, useState } from 'react'

import type {
  ListReviewsIf,
  JoinedReview,
  ReviewIf,
} from '../../core/review/types'

import ReviewList from './ReviewList'

import './Review.css'
import { parseSearchParams } from './search-params'

const pageSize = 20

interface Props {
  listReviewsIf: ListReviewsIf
  reviewIf: ReviewIf
}

function Reviews(props: Props): React.JSX.Element {
  const [loadedReviews, setLoadedReviews] = useState<
    JoinedReview[] | undefined
  >(undefined)
  const { list, reviewList, isLoading, isUninitialized } =
    props.listReviewsIf.useList()

  const searchParameters = props.listReviewsIf.filterIf.useUrlSearchParams()
  const parsedSearchParams = parseSearchParams({
    initialSorting: {
      order: 'time',
      direction: 'desc',
    },
    searchParams: searchParameters,
    minTime: props.listReviewsIf.filterIf.minTime,
    maxTime: props.listReviewsIf.filterIf.maxTime,
    getUseDebounce: props.listReviewsIf.filterIf.getUseDebounce,
    setState: (state) => props.listReviewsIf.filterIf.setSearch({ ...state }),
  })
  const order = parsedSearchParams.reviewListParams.sortingOrder
  const direction = parsedSearchParams.reviewListParams.sortingDirection

  useEffect(() => {
    setLoadedReviews(undefined)
  }, [parsedSearchParams.changeDetectionString])

  const reviewArray = reviewList === undefined ? [] : [...reviewList.reviews]
  const hasMore =
    reviewArray.length > 0 || isUninitialized || loadedReviews === undefined

  const { minRating, maxRating } = parsedSearchParams.filters
  const minRatingValue = minRating.value
  const maxRatingValue = maxRating.value
  const { minTime, maxTime } = parsedSearchParams

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await list({
        pagination: {
          skip: loadedReviews?.length ?? 0,
          size: pageSize,
        },
        sorting: { order, direction },
        filter: {
          minRating: minRatingValue,
          maxRating: maxRatingValue,
          minTime,
          maxTime,
        },
      })
      setLoadedReviews([...(loadedReviews ?? []), ...result.reviews])
    }
    function checkLoad(): void {
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
    direction,
    minRatingValue,
    maxRatingValue,
    minTime,
    maxTime,
  ])

  return (
    <div>
      <h3>Reviews</h3>
      <ReviewList
        filterState={{
          isOpen: parsedSearchParams.reviewListParams.isFiltersOpen,
          setIsOpen: parsedSearchParams.setIsFiltersOpen,
          filters: parsedSearchParams.filters,
        }}
        reviewIf={props.reviewIf}
        isLoading={isLoading}
        isTitleVisible={false}
        reviews={loadedReviews ?? []}
        sorting={reviewList?.sorting}
        setSorting={parsedSearchParams.changeSortingOrder}
        supportedSorting={['rating', 'time']}
        onChanged={() => {
          setLoadedReviews([])
        }}
      />
    </div>
  )
}

export default Reviews
