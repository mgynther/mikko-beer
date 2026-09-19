import type { NavigateIf } from '../types/types'
import React, { useEffect, useState } from 'react'

import type { CreateReviewIf, ReviewRequest } from '../types/review/types'
import type { GetStorageIf, Storage } from '../types/storage/types'

import Button from '../internal/common/Button'
import LoadingIndicator from '../internal/common/LoadingIndicator'
import { formatDateString } from '../util'
import type { UseUrlPathParams } from '../types/types'

import ReviewEditor, {
  type InitialReview,
} from '../internal/review/ReviewEditor'

import './AddReview.css'

function toInitialReview(
  storageData: Storage,
  currentDate: Date,
): InitialReview {
  // TODO add user editable template and save it to localStorage.
  // prettier-ignore
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
      time,
    },
    joined: {
      ...storageData,
      additionalInfo,
      id: '',
      location: undefined,
      rating: 7,
      styles: [],
      time,
    },
  }
}

export interface Props {
  createReviewIf: CreateReviewIf
  getStorageIf: GetStorageIf
  navigateIf: NavigateIf
  useUrlPathParams: UseUrlPathParams
}

function AddReview(props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  const { storageId: paramsStorageId } = props.useUrlPathParams()
  const storageId = paramsStorageId ?? ''
  const [review, setReview] = useState<ReviewRequest | undefined>(undefined)
  const {
    create,
    isLoading,
    isSuccess,
    review: createdReview,
  } = props.createReviewIf.useCreate()
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

  function doAddReview(review: ReviewRequest): void {
    void create({ body: review, storageId })
  }

  if (storageId !== '' && !isLoadingStorage && storage === undefined) {
    return <div>Error, storage does not exist.</div>
  }

  const clickHandler = review
    ? (): void => {
        doAddReview(review)
      }
    : undefined

  return (
    <div>
      <h3>Add review</h3>
      <LoadingIndicator isLoading={isLoadingStorage} />
      {storageId === '' && (
        <ReviewEditor
          searchLocationIf={props.createReviewIf.searchLocationIf}
          selectBeerIf={props.createReviewIf.selectBeerIf}
          reviewContainerIf={props.createReviewIf.reviewContainerIf}
          currentDate={currentDate}
          initialReview={undefined}
          isFromStorage={false}
          onChange={(review) => {
            setReview(review)
          }}
        />
      )}
      {storage !== undefined && (
        <ReviewEditor
          searchLocationIf={props.createReviewIf.searchLocationIf}
          selectBeerIf={props.createReviewIf.selectBeerIf}
          reviewContainerIf={props.createReviewIf.reviewContainerIf}
          currentDate={currentDate}
          initialReview={toInitialReview(storage, currentDate)}
          isFromStorage={true}
          onChange={(review) => {
            setReview(review)
          }}
        />
      )}

      <br />

      <div>
        <Button
          className='AddReview-add-button'
          disabled={
            review === undefined || isLoading || createdReview !== undefined
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
