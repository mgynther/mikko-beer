import React, { useState } from 'react'

import type {
  ListReviewsByIf,
  ReviewIf,
  ReviewSorting,
  ReviewSortingOrder
} from "../../core/review/types"
import ReviewList from "../review/ReviewList"
import type { ListDirection } from '../../core/types'
import type { SearchIf } from '../../core/search/types'

interface Props {
  locationId: string
  listReviewsByLocationIf: ListReviewsByIf
  reviewIf: ReviewIf
  searchIf: SearchIf
}

const LocationReviews = (props: Props): React.JSX.Element => {
  const [order, doSetOrder] = useState<ReviewSortingOrder>('beer_name')
  const [direction, doSetDirection] = useState<ListDirection>('asc')
  const { reviews, isLoading: isLoadingReviews } =
    props.listReviewsByLocationIf.useList({
      id: props.locationId,
      sorting: {
        order,
        direction
      }
    })
  return <ReviewList
    reviewIf={props.reviewIf}
    searchIf={props.searchIf}
    isLoading={isLoadingReviews}
    isTitleVisible={true}
    reviews={reviews?.reviews ?? []}
    sorting={reviews?.sorting}
    setSorting={(sorting: ReviewSorting) => {
      if (order !== sorting.order) {
        doSetOrder(sorting.order)
      }
      if (direction !== sorting.direction) {
        doSetDirection(sorting.direction)
      }
    }}
    supportedSorting={['beer_name', 'brewery_name', 'rating', 'time']}
    onChanged={() => undefined}
    />
}

export default LocationReviews
