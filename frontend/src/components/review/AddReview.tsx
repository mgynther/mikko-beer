import { useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import { useCreateReviewMutation } from '../../store/review/api'
import { type ReviewRequest } from '../../core/review/types'
import { useGetStorageQuery } from '../../store/storage/api'
import { type Storage } from '../../core/storage/types'

import LoadingIndicator from '../common/LoadingIndicator'
import { formatBestBefore } from '../util'

import ReviewEditor, { type InitialReview } from './ReviewEditor'
import {
  type ReviewContainerIf
} from '../../core/review/types'
import type { SelectStyleIf } from '../../core/style/types'

function toInitialReview (storageData: Storage): InitialReview {
  if (storageData === undefined) {
    throw new Error('must wait for storageData to load')
  }
  // TODO add user editable template and store it to localStorage.
  const additionalInfo =
    `From storage, BB ${formatBestBefore(storageData.bestBefore)}`
  const time = new Date().toISOString()
  return {
    review: {
      additionalInfo,
      beer: storageData.beerId,
      container: storageData.container.id,
      location: '',
      rating: 7,
      smell: '',
      taste: '',
      time
    },
    joined: {
      ...storageData,
      additionalInfo,
      id: '',
      location: '',
      rating: 7,
      styles: [],
      time
    }
  }
}

interface Props {
  reviewContainerIf: ReviewContainerIf
  selectStyleIf: SelectStyleIf
}

function AddReview (props: Props): JSX.Element {
  const navigate = useNavigate()
  const { storageId } = useParams()
  const [review, setReview] = useState<ReviewRequest | undefined>(undefined)
  const [
    createReview,
    { isLoading: isCreating, isSuccess, data: createResult }
  ] = useCreateReviewMutation()
  const { data: storageData, isLoading: isLoadingStorage } =
    storageId === undefined
      ? { data: undefined, isLoading: false }
      : useGetStorageQuery(storageId)

  useEffect(() => {
    if (isSuccess && createResult !== undefined) {
      navigate(`/beers/${createResult.review.beer}`)
    }
  }, [isSuccess, createResult])

  async function doAddReview (): Promise<void> {
    if (review === undefined) return
    void createReview({ body: review, storageId })
  }

  function getInitialReview (): InitialReview | undefined {
    if (storageId === undefined) {
      return undefined
    }
    if (storageData === undefined) {
      throw new Error('must not be called without storageData')
    }
    return toInitialReview(storageData.storage)
  }

  return (
    <div>
      <h3>Add review</h3>
      <LoadingIndicator isLoading={isLoadingStorage} />
      {(storageId === undefined || storageData !== undefined) && (
        <ReviewEditor
          reviewContainerIf={props.reviewContainerIf}
          selectStyleIf={props.selectStyleIf}
          initialReview={getInitialReview()}
          isFromStorage={storageId !== undefined}
          onChange={review => { setReview(review) }}
        />
      )}

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
