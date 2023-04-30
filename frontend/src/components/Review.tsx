import { useState } from 'react'

import { type Container } from '../store/container/types'
import { useGetReviewMutation } from '../store/review/api'
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
    <div className="Review-heading">
      <div>Breweries</div>
      <div>Name</div>
      <div>Styles</div>
      <div>Rating</div>
      <div>Time</div>
      <div>Container</div>
      <div>Location</div>
      <div>Additional info</div>
      <div></div>
    </div>
  )
}

function Review (props: ReviewProps): JSX.Element {
  const [getReview] = useGetReviewMutation()

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
    <div className="Review" key={props.id}>
      <div className="Review-first-row">
        <div>
          {props.breweries}
        </div>
        <div>{props.beer}</div>
        <div>
          {props.styles}
        </div>
        <div>{props.rating}</div>
        <div>{formatDate(new Date(props.time))}</div>
        <div>{props.container.type} {props.container.size}</div>
        <div>{props.location}</div>
        <div>{props.additionalInfo}</div>
        <div>
          {!isOpen && (
            <button
              onClick={() => {
                void fetchReview(props.id)
              }}>
              Open
            </button>
          )}
        </div>
      </div>
      {isOpen &&
        fullReview !== undefined && (
          <div className="Review-second-row">
            <div>{fullReview.smell}</div>
            <div>{fullReview.taste}</div>
          </div>
      )}
    </div>
  )
}

export default Review
