import type {
  JoinedReview,
  ReviewIf,
  ReviewSorting,
  ReviewSortingOrder
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
  setSorting: ((sorting: ReviewSorting) => void) | undefined
  supportedSorting: ReviewSortingOrder[]
  onChanged: () => void
}

function ReviewList (props: Props): JSX.Element {
  return (
    <div>
      {props.isTitleVisible && <h4>Reviews</h4>}
      <LoadingIndicator isLoading={props.isLoading} />
      <div className="Review-content">
        <ReviewHeading
          sorting={props.sorting}
          setSorting={props.setSorting}
          supportedSorting={props.supportedSorting}
        />
        <div>
          {props.reviews.map((review) => {
            return (
              <Review
                reviewIf={props.reviewIf}
                searchIf={props.searchIf}
                key={review.id}
                review={review}
                onChanged={props.onChanged}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ReviewList
