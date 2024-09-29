import { useState } from 'react'

import type { ListReviewsByIf } from "../../core/review/types"
import ReviewList from "../review/ReviewList"
import type { ReviewIf, ReviewSorting, ReviewSortingOrder } from '../../core/review/types'
import type { ListDirection } from '../../core/types'
import type { SearchIf } from '../../core/search/types'

interface Props {
  breweryId: string
  listReviewsByBreweryIf: ListReviewsByIf
  reviewIf: ReviewIf
  searchIf: SearchIf
}

const BreweryReviews = (props: Props) => {
  const [order, doSetOrder] = useState<ReviewSortingOrder>('beer_name')
  const [direction, doSetDirection] = useState<ListDirection>('asc')
  const { reviews, isLoading: isLoadingReviews } =
    props.listReviewsByBreweryIf.useList({
      id: props.breweryId,
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
    onChanged={() => {}}
    />
}

export default BreweryReviews
