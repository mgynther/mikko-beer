import React from 'react'

import { useParams } from 'react-router-dom'

import { useGetBreweryQuery } from '../store/brewery/api'
import { useListReviewsByBreweryQuery } from '../store/review/api'

import LoadingIndicator from './LoadingIndicator'
import Review, { ReviewHeading } from './Review'

import './Review.css'

function NotFound (): JSX.Element {
  return <div>Not found</div>
}

function Brewery (): JSX.Element {
  const { breweryId } = useParams()
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
    <>
      <h3>{ brewery.name }</h3>
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
    </>
  )
}

export default Brewery
