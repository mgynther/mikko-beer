import React, { useState } from 'react'

import { useParams } from 'react-router-dom'

import { useGetBreweryQuery } from '../../store/brewery/api'
import { type Brewery as BreweryType } from '../../store/brewery/types'
import { useListReviewsByBreweryQuery } from '../../store/review/api'

import EditButton from '../EditButton'
import LoadingIndicator from '../LoadingIndicator'
import Review, { ReviewHeading } from '../Review'

import UpdateBrewery from './UpdateBrewery'

import '../Review.css'

function NotFound (): JSX.Element {
  return <div>Not found</div>
}

enum Mode {
  View = 'View',
  Edit = 'Edit'
}

function Brewery (): JSX.Element {
  const { breweryId } = useParams()
  const [mode, setMode] = useState(Mode.View)
  const [initialBrewery, setInitialBrewery] =
    useState<BreweryType | undefined>(undefined)
  if (breweryId === undefined) {
    throw new Error('Brewery component without breweryId. Should not happen.')
  }
  const { data: breweryData, isLoading } = useGetBreweryQuery(breweryId)
  const { data: reviewData, isLoading: isLoadingReviews } =
    useListReviewsByBreweryQuery(breweryId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (breweryData?.brewery === undefined) return <NotFound />
  const brewery = breweryData.brewery
  return (
    <div>
      {mode === Mode.View && (
        <>
          <h3>
            { brewery.name }
            <EditButton
              disabled={brewery === undefined}
              onClick={() => {
                setMode(Mode.Edit)
                setInitialBrewery({ ...brewery })
              }}
            />
          </h3>
        </>
      )}
      {mode === Mode.Edit && initialBrewery !== undefined && (
        <UpdateBrewery
          initialBrewery={initialBrewery}
          onCancel={() => {
            setInitialBrewery(undefined)
            setMode(Mode.View)
          }}
          onSaved={() => {
            setMode(Mode.View)
          }}
        />
      )}
      <h4>Reviews</h4>
      <LoadingIndicator isLoading={isLoadingReviews} />
      <div className="Review-content">
        <ReviewHeading />
        <div>
          {reviewData?.reviews.map(review => (
            <Review key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Brewery
