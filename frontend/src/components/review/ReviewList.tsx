import {
  type JoinedReview,
  type ReviewSorting,
  type ReviewSortingOrder
} from '../../store/review/types'

import { getDirectionSymbol, invertDirection } from '../list-helpers'
import LoadingIndicator from '../common/LoadingIndicator'
import TabButton from '../common/TabButton'

import Review from './Review'

import './ReviewList.css'

interface HeadingProps {
  sorting: ReviewSorting | undefined
  setSorting: ((sorting: ReviewSorting) => void) | undefined
}

export function ReviewHeading (
  props: HeadingProps
): JSX.Element {
  function isSelected (property: ReviewSortingOrder): boolean {
    return props.sorting?.order === property
  }
  function formatTitle (base: string, property: ReviewSortingOrder): string {
    const directionSymbol = isSelected(property)
      ? getDirectionSymbol(props.sorting?.direction)
      : ''
    return `${base} ${directionSymbol}`
  }
  const ratingTitle = formatTitle('Rating', 'rating')
  const timeTitle = formatTitle('Time', 'time')
  function createClickHandler (property: ReviewSortingOrder): () => void {
    return () => {
      if (props.setSorting === undefined) return
      if (isSelected(property)) {
        props.setSorting({
          order: property,
          direction: invertDirection(props.sorting?.direction)
        })
        return
      }
      props.setSorting({ order: property, direction: 'desc' })
    }
  }
  return (
    <div className='Review-heading'>
      <div>Breweries</div>
      <div>Name</div>
      <div>Styles</div>
      {props.sorting === undefined &&
        <div className="Review-rating-heading">Rating</div>
      }
      {props.sorting !== undefined &&
        <TabButton
          title={ratingTitle}
          onClick={createClickHandler('rating')}
          isCompact={true}
          isSelected={props.sorting?.order === 'rating'} />}
      {props.sorting === undefined &&
        <div className="Review-time-heading">Time</div>
      }
      {props.sorting !== undefined &&
        <TabButton
          title={timeTitle}
          onClick={createClickHandler('time')}
          isCompact={true}
          isSelected={props.sorting?.order === 'time'} />}
    </div>
  )
}

interface Props {
  isLoading: boolean
  isTitleVisible: boolean
  reviews: JoinedReview[]
  sorting: ReviewSorting | undefined
  setSorting: ((sorting: ReviewSorting) => void) | undefined
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
        />
        <div>
          {props.reviews.map((review) => {
            return (
              <Review
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
