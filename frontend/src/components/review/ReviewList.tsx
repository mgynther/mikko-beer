import { type JoinedReview } from '../../store/review/types'

import LoadingIndicator from '../common/LoadingIndicator'

import Review from './Review'

import './ReviewList.css'

export function ReviewHeading (): JSX.Element {
  return (
    <div className='Review-heading'>
      <div>Breweries</div>
      <div>Name</div>
      <div>Styles</div>
      <div className='Review-rating-heading'>Rating</div>
      <div className='Review-time-heading'>Time</div>
    </div>
  )
}

interface Props {
  isLoading: boolean
  isTitleVisible: boolean
  reviews: JoinedReview[]
}

function ReviewList (props: Props): JSX.Element {
  return (
    <div>
      {props.isTitleVisible && <h4>Reviews</h4>}
      <LoadingIndicator isLoading={props.isLoading} />
      <div className="Review-content">
        <ReviewHeading />
        <div>
          {props.reviews.map((review) => {
            return (
              <Review key={review.id} review={review} />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ReviewList
