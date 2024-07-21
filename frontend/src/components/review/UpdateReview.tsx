import { useState } from 'react'

import type { UpdateReviewIf } from '../../core/review/types'

import { type JoinedReview, type ReviewRequest } from '../../core/review/types'

import EditActions from '../common/EditActions'

import ReviewEditor from './ReviewEditor'

interface Props {
  updateReviewIf: UpdateReviewIf
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
  const { update, isLoading } = props.updateReviewIf.useUpdate()
  async function doUpdate (): Promise<void> {
    if (newReview === undefined) {
      throw new Error('review must not be undefined when updating')
    }
    try {
      await update({
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
        selectBeerIf={props.updateReviewIf.selectBeerIf}
        reviewContainerIf={props.updateReviewIf.reviewContainerIf}
        initialReview={props.initialReview}
        isFromStorage={false}
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
        onSave={() => { void doUpdate() }}
      />
    </>
  )
}

export default UpdateReview
