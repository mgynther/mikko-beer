import { useState } from 'react'

import { type Container } from '../store/container/types'
import { useLazyGetReviewQuery } from '../store/review/api'
import { type Review as ReviewType } from '../store/review/types'

import './Review.css'

export interface ReviewProps {
  id: string
  breweries: string
  beer: string
  rating: number
  time: string
  container: Container
  additionalInfo: string
  location: string
  styles: string
}

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

function Review (props: ReviewProps): JSX.Element {
  const [getReview] = useLazyGetReviewQuery()

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
    <div className='Review' key={props.id} onClick={() => {
      if (fullReview === undefined) {
        void fetchReview(props.id)
        return
      }
      setIsOpen(!isOpen)
    }}>
      <div className='Review-primary-info-row'>
        <div>
          {props.breweries}
        </div>
        <div>{props.beer}</div>
        <div>
          {props.styles}
        </div>
        <div
          className={`Review-rating Review-rating-${props.rating}`}>
          <div>{props.rating}</div>
        </div>
        <div className='Review-time'>{formatDate(new Date(props.time))}</div>
      </div>
      <div className='Review-secondary-info-row'>
        <div>{props.container.type} {props.container.size}</div>
        <div>{props.location}</div>
      </div>
      {props.additionalInfo !== '' && (
        <div className='Review-additional-row'>
          <div className='Review-additional'>{props.additionalInfo}</div>
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
