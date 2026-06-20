import React from 'react'

import type {
  JoinedReview,
  ReviewIf,
  ReviewSorting,
  ReviewSortingOrder,
} from '../../core/review/types'

import LoadingIndicator from '../common/LoadingIndicator'

import Review from './Review'
import ReviewHeading from './ReviewHeading'

import './ReviewList.css'
import type { ReviewFilterState } from './filter-types'

interface Props {
  filterState: ReviewFilterState
  reviewIf: ReviewIf
  isLoading: boolean
  isTitleVisible: boolean
  reviews: JoinedReview[]
  sorting: ReviewSorting | undefined
  setSorting: (sorting: ReviewSortingOrder) => void
  supportedSorting: ReviewSortingOrder[]
  onChanged: (() => void) | undefined
}

function ReviewList(props: Props): React.JSX.Element {
  return (
    <div>
      {props.isTitleVisible && <h4>Reviews</h4>}
      <div className='Review-content'>
        <ReviewHeading
          filterState={props.filterState}
          sorting={props.sorting}
          setSorting={props.setSorting}
          supportedSorting={props.supportedSorting}
        />
        <LoadingIndicator isLoading={props.isLoading} />
        <div>
          {props.reviews.map((review) => (
            <Review
              reviewIf={props.reviewIf}
              key={review.id}
              review={review}
              onChanged={props.onChanged}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReviewList
