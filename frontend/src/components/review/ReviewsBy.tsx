import React from 'react'

import type { ListReviewsByIf } from '../../core/review/types'
import ReviewList from '../review/ReviewList'
import { parseSearchParams } from './search-params'

interface Props {
  id: string
  listReviewsByIf: ListReviewsByIf
}

const ReviewsBy = (props: Props): React.JSX.Element => {
  const searchParameters = props.listReviewsByIf.filterIf.useUrlSearchParams()

  const parsedSearchParams = parseSearchParams({
    initialSorting: {
      order: 'beer_name',
      direction: 'asc',
    },
    searchParams: searchParameters,
    minTime: props.listReviewsByIf.filterIf.minTime,
    maxTime: props.listReviewsByIf.filterIf.maxTime,
    getUseDebounce: props.listReviewsByIf.filterIf.getUseDebounce,
    setState: (state) => props.listReviewsByIf.filterIf.setSearch({ ...state }),
  })
  const order = parsedSearchParams.reviewListParams.sortingOrder
  const direction = parsedSearchParams.reviewListParams.sortingDirection
  const { minRating, maxRating } = parsedSearchParams.filters
  const minRatingValue = minRating.value
  const maxRatingValue = maxRating.value
  const { minTime, maxTime } = parsedSearchParams

  const { reviews, isLoading: isLoadingReviews } =
    props.listReviewsByIf.useList({
      id: props.id,
      sorting: {
        order,
        direction,
      },
      filter: {
        minRating: minRatingValue,
        maxRating: maxRatingValue,
        minTime,
        maxTime,
      },
    })

  return (
    <ReviewList
      filterState={{
        isOpen: parsedSearchParams.reviewListParams.isFiltersOpen,
        setIsOpen: parsedSearchParams.setIsFiltersOpen,
        filters: parsedSearchParams.filters,
      }}
      reviewIf={props.listReviewsByIf.reviewIf}
      isLoading={isLoadingReviews}
      isTitleVisible={true}
      reviews={reviews?.reviews ?? []}
      sorting={reviews?.sorting}
      setSorting={parsedSearchParams.changeSortingOrder}
      supportedSorting={['beer_name', 'brewery_name', 'rating', 'time']}
      onChanged={undefined}
    />
  )
}

export default ReviewsBy
