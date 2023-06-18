import { useState } from 'react'

import { useUpdateReviewMutation } from '../../store/review/api'
import { type JoinedReview, type ReviewRequest } from '../../store/review/types'

import EditActions from '../common/EditActions'

import ReviewEditor from './ReviewEditor'

interface Props {
  initialReview: {
    joined: JoinedReview
    review: ReviewRequest
  }
  onCancel: () => void
  onSaved: () => void
}

function UpdateReview (props: Props): JSX.Element {
  const [newReview, setNewReview] = useState<ReviewRequest | undefined>(
    undefined
  )
  const [updateReview, { isLoading }] =
    useUpdateReviewMutation()
  async function update (): Promise<void> {
    if (newReview === undefined) {
      throw new Error('review must not be undefined when updating')
    }
    try {
      await updateReview({
        ...newReview,
        id: props.initialReview.joined.id
      })
      props.onSaved()
    } catch (e) {
      console.warn('Failed to update review', e)
    }
  }
  return (
    <>
      <ReviewEditor
        initialReview={props.initialReview}
        onChange={(review: ReviewRequest | undefined) => {
          setNewReview(review)
        }}
      />
      <EditActions
        isSaveDisabled={newReview === undefined}
        isSaving={isLoading}
        onCancel={() => {
          setNewReview(undefined)
          props.onCancel()
        }}
        onSave={() => { void update() }}
      />
    </>
  )
}

export default UpdateReview
