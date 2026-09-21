import React, { useEffect, useState } from 'react'

import type {
  ListReviewsIf,
  JoinedReview,
  ReviewIf,
} from '../types/review/types'

import { useLoadMore } from '../internal/common/use-load-more'
import ReviewList from '../internal/review/ReviewList'

import './Review.css'
import { parseSearchParams } from '../internal/review/search-params'
import type { LinkComponent } from '../common/link'

const pageSize = 20

interface Props {
  linkComponent: LinkComponent
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

  const checkLoad = useLoadMore({
    hasMore,
    isLoading,
    items: loadedReviews,
    loadPage: async (skip: number) =>
      (
        await list({
          pagination: { skip, size: pageSize },
          sorting: { order, direction },
          filter: {
            minRating: minRatingValue,
            maxRating: maxRatingValue,
            minTime,
            maxTime,
          },
        })
      ).reviews,
    setItems: setLoadedReviews,
  })

  // Observing the end of the content reports whether it is in view, so
  // subscribing again once a page has arrived is what loads the next one
  // while the list is still shorter than the window.
  useEffect(
    () => props.listReviewsIf.infiniteScroll(checkLoad),
    [checkLoad, loadedReviews, isLoading, hasMore],
  )

  return (
    <div>
      <h3>Reviews</h3>
      <ReviewList
        linkComponent={props.linkComponent}
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
