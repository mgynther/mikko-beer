import React, { useEffect, useState } from 'react'

import type {
  ListReviewsIf,
  JoinedReview,
  ReviewIf,
} from '../../core/review/types'
import type { SearchIf } from '../../core/search/types'

import ReviewList from './ReviewList'

import './Review.css'
import { parseSearchParams } from './search-params'
import type { UrlParamsIf } from '../util'
import { toTimestamp } from '../common/filter-util'

const pageSize = 20

interface Props {
  listReviewsIf: ListReviewsIf
  urlParamsIf: UrlParamsIf
  reviewIf: ReviewIf
  searchIf: SearchIf
}

function Reviews(props: Props): React.JSX.Element {
  const [loadedReviews, setLoadedReviews] = useState<
    JoinedReview[] | undefined
  >(undefined)
  const { list, reviewList, isLoading, isUninitialized } =
    props.listReviewsIf.useList()

  const searchParameters = props.urlParamsIf.useSearchParams()
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
  }, [parsedSearchParams.searchString])

  const reviewArray = reviewList === undefined ? [] : [...reviewList.reviews]
  const hasMore =
    reviewArray.length > 0 || isUninitialized || loadedReviews === undefined

  const { minRating, maxRating, minTime, maxTime } = parsedSearchParams.filters
  const minRatingValue = minRating.value
  const maxRatingValue = maxRating.value
  const minTimeValue = toTimestamp(minTime.value, 'start')
  const maxTimeValue = toTimestamp(maxTime.value, 'end')

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
          minTime: minTimeValue,
          maxTime: maxTimeValue,
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
    minTimeValue,
    maxTimeValue,
  ])

  return (
    <div>
      <h3>Reviews</h3>
      <ReviewList
        isFiltersOpen={parsedSearchParams.reviewListParams.isFiltersOpen}
        setIsFiltersOpen={parsedSearchParams.setIsFiltersOpen}
        reviewFilters={parsedSearchParams.filters}
        reviewIf={props.reviewIf}
        isLoading={isLoading}
        isTitleVisible={false}
        reviews={loadedReviews ?? []}
        searchIf={props.searchIf}
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
