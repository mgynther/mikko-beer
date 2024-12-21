import React, { useEffect, useState } from 'react'

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
import { formatDateString, type NavigateIf, type ParamsIf } from '../util'

import ReviewEditor, { type InitialReview } from './ReviewEditor'

function toInitialReview (
  storageData: Storage,
  currentDate: Date
): InitialReview {
  // TODO add user editable template and save it to localStorage.
  const additionalInfo =
    `From storage, BB ${formatDateString(storageData.bestBefore)}`
  const time = currentDate.toISOString()
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

export interface Props {
  createReviewIf: CreateReviewIf
  getStorageIf: GetStorageIf
  navigateIf: NavigateIf
  paramsIf: ParamsIf
  searchIf: SearchIf
}

function AddReview (props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  const { storageId } = props.paramsIf.useParams()
  const [review, setReview] = useState<ReviewRequest | undefined>(undefined)
  const {
    create,
    isLoading,
    isSuccess,
    review: createdReview,
  } =
    props.createReviewIf.useCreate()
  const [currentDate] = useState<Date>(props.createReviewIf.getCurrentDate())
  const { storage, isLoading: isLoadingStorage } =
    storageId === undefined
      ? { storage: undefined, isLoading: false }
      : props.getStorageIf.useGet(storageId)

  useEffect(() => {
    if (isSuccess && createdReview !== undefined) {
      navigate(`/beers/${createdReview.beer}`)
    }
  }, [isSuccess, createdReview])

  function doAddReview (): void {
    if (review === undefined) return
    void create({ body: review, storageId })
  }

  function getInitialReview (currentDate: Date): InitialReview | undefined {
    if (storageId === undefined) {
      return undefined
    }
    if (storage === undefined) {
      throw new Error('must not be called without storageData')
    }
    return toInitialReview(storage, currentDate)
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
          currentDate={currentDate}
          initialReview={getInitialReview(currentDate)}
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
          onClick={() => { doAddReview() }}
        >
          Add
        </button>
        <LoadingIndicator isLoading={isLoading} />
      </div>
    </div>
  )
}

export default AddReview
