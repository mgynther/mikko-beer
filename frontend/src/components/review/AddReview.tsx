import { useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import type {
  CreateReviewIf,
  ReviewRequest
} from '../../core/review/types'
import type { SearchIf } from '../../core/search/types'
import type {
  GetStorageIf,
  Storage
} from '../../core/storage/types'

import LoadingIndicator from '../common/LoadingIndicator'
import { formatBestBefore } from '../util'

import ReviewEditor, { type InitialReview } from './ReviewEditor'

function toInitialReview (storageData: Storage): InitialReview {
  if (storageData === undefined) {
    throw new Error('must wait for storageData to load')
  }
  // TODO add user editable template and save it to localStorage.
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
  createReviewIf: CreateReviewIf
  getStorageIf: GetStorageIf
  searchIf: SearchIf
}

function AddReview (props: Props): JSX.Element {
  const navigate = useNavigate()
  const { storageId } = useParams()
  const [review, setReview] = useState<ReviewRequest | undefined>(undefined)
  const { create, isLoading, isSuccess, review: createdReview } =
    props.createReviewIf.useCreate()
  const { storage, isLoading: isLoadingStorage } =
    storageId === undefined
      ? { storage: undefined, isLoading: false }
      : props.getStorageIf.useGet(storageId)

  useEffect(() => {
    if (isSuccess && createdReview !== undefined) {
      navigate(`/beers/${createdReview.beer}`)
    }
  }, [isSuccess, createdReview])

  async function doAddReview (): Promise<void> {
    if (review === undefined) return
    void create({ body: review, storageId })
  }

  function getInitialReview (): InitialReview | undefined {
    if (storageId === undefined) {
      return undefined
    }
    if (storage === undefined) {
      throw new Error('must not be called without storageData')
    }
    return toInitialReview(storage)
  }

  return (
    <div>
      <h3>Add review</h3>
      <LoadingIndicator isLoading={isLoadingStorage} />
      {(storageId === undefined || storage !== undefined) && (
        <ReviewEditor
          searchIf={props.searchIf}
          selectBeerIf={props.createReviewIf.selectBeerIf}
          reviewContainerIf={props.createReviewIf.reviewContainerIf}
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
            isLoading ||
            createdReview !== undefined
          }
          onClick={() => { void doAddReview() }}
        >
          Add
        </button>
        <LoadingIndicator isLoading={isLoading} />
      </div>
    </div>
  )
}

export default AddReview
