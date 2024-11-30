import React, { useState } from 'react'

import type {
  JoinedReview,
  Review as ReviewType,
  ReviewIf
} from '../../core/review/types'
import type { SearchIf } from '../../core/search/types'

import BeerLink from '../beer/BeerLink'
import BreweryLinks from '../brewery/BreweryLinks'
import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'
import StyleLinks from '../style/StyleLinks'

import UpdateReview from './UpdateReview'

import './Review.css'

interface Props {
  reviewIf: ReviewIf
  review: JoinedReview
  searchIf: SearchIf
  onChanged: () => void
}

function Review (props: Props): React.JSX.Element {
  const [mode, setMode] = useState(EditableMode.View)
  const { get } = props.reviewIf.get.useGet()
  const review = props.review

  const [isOpen, setIsOpen] = useState(false)

  const [fullReview, setFullReview] =
    useState<ReviewType | undefined>(undefined)

  async function fetchReview (id: string): Promise<void> {
    setIsOpen(true)
    const review = await get(id)
    if (review !== undefined) {
      setFullReview(review)
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
                    disabled={false}
                    getLogin={props.reviewIf.login}
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
            searchIf={props.searchIf}
            updateReviewIf={props.reviewIf.update}
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
