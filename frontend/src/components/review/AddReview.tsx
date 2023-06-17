import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useCreateReviewMutation } from '../../store/review/api'
import { type ReviewRequest } from '../../store/review/types'

import LoadingIndicator from '../common/LoadingIndicator'

import ReviewEditor from './ReviewEditor'

function AddReview (): JSX.Element {
  const navigate = useNavigate()
  const [review, setReview] = useState<ReviewRequest | undefined>(undefined)
  const [
    createReview,
    { isLoading: isCreating, isSuccess, data: createResult }
  ] = useCreateReviewMutation()

  useEffect(() => {
    if (isSuccess && createResult !== undefined) {
      navigate(`/beers/${createResult.review.beer}`)
    }
  }, [isSuccess, createResult])

  async function doAddReview (): Promise<void> {
    if (review === undefined) return
    void createReview(review)
  }
  return (
    <div>
      <h3>Add review</h3>
      <ReviewEditor
        initialReview={undefined}
        onChange={review => { setReview(review) }}
      />

      <br />

      <div>
        <button
          disabled={
            review === undefined ||
            isCreating ||
            createResult !== undefined
          }
          onClick={() => { void doAddReview() }}
        >
          Add
        </button>
        <LoadingIndicator isLoading={isCreating} />
      </div>
    </div>
  )
}

export default AddReview
