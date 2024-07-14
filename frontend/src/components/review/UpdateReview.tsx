import { useState } from 'react'

import { type ReviewContainerIf } from '../../core/review/types'

import { useUpdateReviewMutation } from '../../store/review/api'
import { type JoinedReview, type ReviewRequest } from '../../core/review/types'

import EditActions from '../common/EditActions'

import ReviewEditor from './ReviewEditor'
import type { SelectStyleIf } from '../../core/style/types'

interface Props {
  reviewContainerIf: ReviewContainerIf
  selectStyleIf: SelectStyleIf
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
        reviewContainerIf={props.reviewContainerIf}
        selectStyleIf={props.selectStyleIf}
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
        onSave={() => { void update() }}
      />
    </>
  )
}

export default UpdateReview
