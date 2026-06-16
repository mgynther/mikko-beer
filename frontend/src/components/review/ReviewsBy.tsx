import React from 'react'

import type { ListReviewsByIf, ReviewIf } from '../../core/review/types'
import ReviewList from '../review/ReviewList'
import type { SearchFieldIf } from '../../core/search/types'
import type { UrlParamsIf } from '../util'
import { parseSearchParams } from './search-params'
import { toTimestamp } from '../common/filter-util'

interface Props {
  id: string
  listReviewsByIf: ListReviewsByIf
  urlParamsIf: UrlParamsIf
  reviewIf: ReviewIf
  searchFieldIf: SearchFieldIf
}

const ReviewsBy = (props: Props): React.JSX.Element => {
  const searchParameters = props.urlParamsIf.useSearchParams()

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
  const { minRating, maxRating, minTime, maxTime } = parsedSearchParams.filters
  const minRatingValue = minRating.value
  const maxRatingValue = maxRating.value
  const minTimeValue = toTimestamp(minTime.value, 'start')
  const maxTimeValue = toTimestamp(maxTime.value, 'end')

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
        minTime: minTimeValue,
        maxTime: maxTimeValue,
      },
    })

  return (
    <ReviewList
      filterState={{
        isOpen: parsedSearchParams.reviewListParams.isFiltersOpen,
        setIsOpen: parsedSearchParams.setIsFiltersOpen,
        filters: parsedSearchParams.filters,
      }}
      reviewIf={props.reviewIf}
      searchFieldIf={props.searchFieldIf}
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
