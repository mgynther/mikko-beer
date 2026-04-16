import React from 'react'

import type {
  JoinedReview,
  ReviewIf,
  ReviewSorting,
  ReviewSortingOrder,
} from '../../core/review/types'
import type { SearchIf } from '../../core/search/types'

import LoadingIndicator from '../common/LoadingIndicator'

import Review from './Review'
import ReviewHeading from './ReviewHeading'

import './ReviewList.css'

interface Props {
  reviewIf: ReviewIf
  isLoading: boolean
  isTitleVisible: boolean
  reviews: JoinedReview[]
  searchIf: SearchIf
  sorting: ReviewSorting | undefined
  setSorting: (sorting: ReviewSorting) => void
  supportedSorting: ReviewSortingOrder[]
  onChanged: (() => void) | undefined
}

function ReviewList(props: Props): React.JSX.Element {
  return (
    <div>
      {props.isTitleVisible && <h4>Reviews</h4>}
      <div className='Review-content'>
        <ReviewHeading
          sorting={props.sorting}
          setSorting={props.setSorting}
          supportedSorting={props.supportedSorting}
        />
        <LoadingIndicator isLoading={props.isLoading} />
        <div>
          {props.reviews.map((review) => (
            <Review
              reviewIf={props.reviewIf}
              searchIf={props.searchIf}
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
