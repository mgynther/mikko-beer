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

import Button from '../common/Button'
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
      location: undefined,
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
  const { storageId: paramsStorageId } = props.paramsIf.useParams()
  const storageId = paramsStorageId ?? ''
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
    storageId === ''
      ? { storage: undefined, isLoading: false }
      : props.getStorageIf.useGet(storageId)

  useEffect(() => {
    if (isSuccess && createdReview !== undefined) {
      void navigate(`/beers/${createdReview.beer}`)
    }
  }, [isSuccess, createdReview])

  function doAddReview (review: ReviewRequest): void {
    void create({ body: review, storageId })
  }

  if (storageId !== '' && !isLoadingStorage && storage === undefined) {
    return <div>Error, storage does not exist.</div>
  }

  const clickHandler = review
    ? (): void => { doAddReview(review) }
    : undefined

  return (
    <div>
      <h3>Add review</h3>
      <LoadingIndicator isLoading={isLoadingStorage} />
      {storageId === '' && (
        <ReviewEditor
          searchIf={props.searchIf}
          searchLocationIf={props.createReviewIf.searchLocationIf}
          selectBeerIf={props.createReviewIf.selectBeerIf}
          reviewContainerIf={props.createReviewIf.reviewContainerIf}
          currentDate={currentDate}
          initialReview={undefined}
          isFromStorage={false}
          onChange={review => { setReview(review) }}
        />
      )}
      {storage !== undefined && (
        <ReviewEditor
          searchIf={props.searchIf}
          searchLocationIf={props.createReviewIf.searchLocationIf}
          selectBeerIf={props.createReviewIf.selectBeerIf}
          reviewContainerIf={props.createReviewIf.reviewContainerIf}
          currentDate={currentDate}
          initialReview={toInitialReview(storage, currentDate)}
          isFromStorage={true}
          onChange={review => { setReview(review) }}
        />
      )}

      <br />

      <div>
        <Button
          disabled={
            review === undefined ||
            isLoading ||
            createdReview !== undefined
          }
          onClick={clickHandler}
          text='Add'
        />
        <LoadingIndicator isLoading={isLoading} />
      </div>
    </div>
  )
}

export default AddReview
