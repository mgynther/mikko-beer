import {
  type JoinedReview,
  type ReviewSorting,
  type ReviewSortingOrder
} from '../../core/review/types'

import { formatTitle, invertDirection } from '../list-helpers'
import LoadingIndicator from '../common/LoadingIndicator'
import TabButton from '../common/TabButton'

import Review from './Review'

import './ReviewList.css'
import type { EditBeerIf } from '../../core/beer/types'
import type { GetLogin } from '../../core/login/types'
import type { ReviewContainerIf } from '../../core/review/types'

interface HeadingProps {
  sorting: ReviewSorting | undefined
  setSorting: ((sorting: ReviewSorting) => void) | undefined
  supportedSorting: ReviewSortingOrder[]
}

export function ReviewHeading (
  props: HeadingProps
): JSX.Element {
  function isSelected (property: ReviewSortingOrder): boolean {
    return props.sorting?.order === property
  }
  const direction = props.sorting?.direction
  const breweryNameTitle =
    formatTitle('Breweries', isSelected('brewery_name'), direction)
  const nameTitle = formatTitle('Name', isSelected('beer_name'), direction)
  const ratingTitle = formatTitle('Rating', isSelected('rating'), direction)
  const timeTitle = formatTitle('Time', isSelected('time'), direction)
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
  function isSortingSupported (property: ReviewSortingOrder): boolean {
    return props.sorting !== undefined &&
      props.supportedSorting.includes(property)
  }
  return (
    <div className='Review-heading'>
      {!isSortingSupported('brewery_name') &&
        <div>Brewerires</div>
      }
      {isSortingSupported('brewery_name') &&
        <TabButton
          title={breweryNameTitle}
          onClick={createClickHandler('brewery_name')}
          isCompact={true}
          isSelected={props.sorting?.order === 'brewery_name'} />}
      {!isSortingSupported('beer_name') &&
        <div>Name</div>
      }
      {isSortingSupported('beer_name') &&
        <TabButton
          title={nameTitle}
          onClick={createClickHandler('beer_name')}
          isCompact={true}
          isSelected={props.sorting?.order === 'beer_name'} />}
      <div>Styles</div>
      {!isSortingSupported('rating') &&
        <div className="Review-rating-heading">Rating</div>
      }
      {isSortingSupported('rating') &&
        <div className="Review-rating-heading">
          <TabButton
            title={ratingTitle}
            onClick={createClickHandler('rating')}
            isCompact={true}
            isSelected={props.sorting?.order === 'rating'} />
        </div>
      }
      {!isSortingSupported('time') &&
        <div className="Review-time-heading">Time</div>
      }
      {isSortingSupported('time') &&
        <div className="Review-time-heading">
          <TabButton
            title={timeTitle}
            onClick={createClickHandler('time')}
            isCompact={true}
            isSelected={props.sorting?.order === 'time'} />
        </div>
      }
    </div>
  )
}

interface Props {
  getLogin: GetLogin
  reviewContainerIf: ReviewContainerIf
  editBeerIf: EditBeerIf
  isLoading: boolean
  isTitleVisible: boolean
  reviews: JoinedReview[]
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
                getLogin={props.getLogin}
                reviewContainerIf={props.reviewContainerIf}
                editBeerIf={props.editBeerIf}
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
