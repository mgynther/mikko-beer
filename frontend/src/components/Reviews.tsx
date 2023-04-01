import { useState } from 'react'

import { useListBeersQuery } from '../store/beer/api'
import { type Beer } from '../store/beer/types'
import { useListBreweriesQuery } from '../store/brewery/api'
import { useListContainersQuery } from '../store/container/api'
import { useListStylesQuery } from '../store/style/api'
import { useGetReviewMutation, useListReviewsQuery } from '../store/review/api'
import { toBeerMap } from '../store/beer/util'
import { toBreweryMap } from '../store/brewery/util'
import { toContainerMap } from '../store/container/util'
import { toStyleMap } from '../store/style/util'
import { type Review } from '../store/review/types'
import { toString } from './util'

import LoadingIndicator from './LoadingIndicator'

import './Reviews.css'

function Reviews (): JSX.Element {
  const { data: beerData, isLoading: areBeersLoading } = useListBeersQuery()
  const beerMap = toBeerMap(beerData)
  const { data: breweryData, isLoading: areBreweriesLoading } =
    useListBreweriesQuery()
  const breweryMap = toBreweryMap(breweryData)
  const { data: containerData, isLoading: areContainersLoading } =
    useListContainersQuery()
  const containerMap = toContainerMap(containerData)
  const { data: styleData, isLoading: areStylesLoading } =
    useListStylesQuery()
  const styleMap = toStyleMap(styleData)
  const { data: reviewData, isLoading: areReviewsLoading } =
    useListReviewsQuery()
  const isLoading = areBeersLoading ||
    areBreweriesLoading ||
    areContainersLoading ||
    areReviewsLoading ||
    areStylesLoading
  const [getReview] = useGetReviewMutation()

  const [openReviews, setOpenReviews] = useState<Record<string, boolean>>({})

  const [fullReviews, setFullReviews] = useState<Record<string, Review>>({})

  async function fetchReview (id: string): Promise<void> {
    const opened = { ...openReviews }
    opened[id] = true
    setOpenReviews(opened)
    const fullReview = await getReview(id)
    const anyReviewData = (fullReview as any).data
    if (anyReviewData?.review !== undefined) {
      const newReviews = { ...fullReviews }
      const reviewData = anyReviewData?.review as Review
      newReviews[reviewData.id] = reviewData
      setFullReviews(newReviews)
    }
  }

  function formatDate (date: Date): string {
    return date.toISOString().substring(0, 10)
  }
  return (
    <div>
      <h3>Reviews</h3>
      <LoadingIndicator isLoading={isLoading} />
      <div className="Review-content">
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
        <div>
          {reviewData?.reviews.map((review: Review) => {
            const beer: Beer = beerMap[review.beer]
            const container = containerMap[review.container]
            return (
              <div className="Review" key={review.id}>
                <div className="Review-first-row">
                  <div>
                    {toString(beer.breweries.map(b => breweryMap[b].name))}
                  </div>
                  <div>{beer.name}</div>
                  <div>
                    {toString(beer.styles.map(s => styleMap[s].name))}
                  </div>
                  <div>{review.rating}</div>
                  <div>{formatDate(new Date(review.time))}</div>
                  <div>{container.type} {container.size}</div>
                  <div>{review.location}</div>
                  <div>{review.additionalInfo}</div>
                  <div>
                    {!openReviews[review.id] && (
                      <button
                        onClick={() => {
                          void fetchReview(review.id)
                        }}>
                        Open
                      </button>
                    )}
                  </div>
                </div>
                {openReviews[review.id] &&
                  fullReviews[review.id] !== undefined && (
                    <div className="Review-second-row">
                      <div>{fullReviews[review.id].smell}</div>
                      <div>{fullReviews[review.id].taste}</div>
                    </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Reviews
