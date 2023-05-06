import { useState } from 'react'

import { useLazyGetReviewQuery } from '../store/review/api'
import {
  type JoinedReview,
  type Review as ReviewType
} from '../store/review/types'

import BeerLink from './BeerLink'
import BreweryLinks from './BreweryLinks'
import { joinSortedNames } from './util'

import './Review.css'

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
  review: JoinedReview
}

function Review (props: Props): JSX.Element {
  const [getReview] = useLazyGetReviewQuery()
  const review = props.review

  const [isOpen, setIsOpen] = useState(false)

  const [fullReview, setFullReview] =
    useState<ReviewType | undefined>(undefined)

  async function fetchReview (id: string): Promise<void> {
    setIsOpen(true)
    const fetched = await getReview(id)
    const anyReviewData = (fetched as any).data
    if (anyReviewData?.review !== undefined) {
      const reviewData = anyReviewData?.review as ReviewType
      setFullReview(reviewData)
    }
  }

  function formatDate (date: Date): string {
    return date.toISOString().substring(0, 10)
  }

  return (
    <div className='Review RowLike' key={review.id} onClick={() => {
      if (fullReview === undefined) {
        void fetchReview(review.id)
        return
      }
      setIsOpen(!isOpen)
    }}>
      <div className='Review-primary-info-row'>
        <div>
          <BreweryLinks breweries={review.breweries} />
        </div>
        <div>
          <BeerLink beer={{
            id: review.beerId,
            name: review.beerName
          }} />
        </div>
        <div>
          {joinSortedNames([...review.styles])}
        </div>
        <div
          className={`Review-rating Review-rating-${review.rating}`}>
          <div>{review.rating}</div>
        </div>
        <div className='Review-time'>{formatDate(new Date(review.time))}</div>
      </div>
      <div className='Review-secondary-info-row'>
        <div>{review.container.type} {review.container.size}</div>
        <div>{review.location}</div>
      </div>
      {review.additionalInfo !== '' && (
        <div className='Review-additional-row'>
          <div className='Review-additional'>{review.additionalInfo}</div>
        </div>
      )}
      {isOpen && fullReview !== undefined && (
          <div className='Review-sensory-row'>
            <div>{fullReview.smell}</div>
            <div>{fullReview.taste}</div>
          </div>
      )}
    </div>
  )
}

export default Review
