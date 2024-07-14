import { useState } from 'react'

import { useLazyGetReviewQuery } from '../../store/review/api'
import {
  type JoinedReview,
  type Review as ReviewType
} from '../../core/review/types'

import BeerLink from '../beer/BeerLink'
import BreweryLinks from '../brewery/BreweryLinks'
import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'
import StyleLinks from '../style/StyleLinks'

import UpdateReview from './UpdateReview'

import './Review.css'
import { type ReviewContainerIf } from '../../core/review/types'
import type { SelectStyleIf } from '../../core/style/types'

interface Props {
  reviewContainerIf: ReviewContainerIf
  selectStyleIf: SelectStyleIf
  review: JoinedReview
  onChanged: () => void
}

function Review (props: Props): JSX.Element {
  const [mode, setMode] = useState(EditableMode.View)
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
    <>
      {mode === EditableMode.View && (
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
              <StyleLinks styles={review.styles} />
            </div>
            <div
              className={`Review-rating Review-rating-${review.rating}`}>
              <div>{review.rating}</div>
            </div>
            <div className='Review-time'>{
              formatDate(new Date(review.time))
            }</div>
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
            <>
              <div className='Review-sensory-row'>
                <div>{fullReview.smell}</div>
                <div>{fullReview.taste}</div>
              </div>
              <div className='Review-additional-row'>
                <div>
                  <EditButton
                    disabled={fullReview === undefined}
                    onClick={() => {
                      setMode(EditableMode.Edit)
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {mode === EditableMode.Edit && fullReview !== undefined && (
        <>
          <UpdateReview
            reviewContainerIf={props.reviewContainerIf}
            selectStyleIf={props.selectStyleIf}
            initialReview={{
              joined: review,
              review: fullReview
            }}
            onCancel={() => {
              setMode(EditableMode.View)
            }}
            onSaved={() => {
              setMode(EditableMode.View)
              void fetchReview(review.id)
              props.onChanged()
            }}
          />
        </>
      )}
    </>
  )
}

export default Review
