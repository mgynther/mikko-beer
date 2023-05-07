import React, { useState } from 'react'

import { useParams } from 'react-router-dom'

import { useGetBreweryQuery } from '../../store/brewery/api'
import { type Brewery as BreweryType } from '../../store/brewery/types'
import { useListReviewsByBreweryQuery } from '../../store/review/api'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'
import LoadingIndicator from '../common/LoadingIndicator'
import ReviewList from '../review/ReviewList'

import UpdateBrewery from './UpdateBrewery'

import '../common/FlexRow.css'

function NotFound (): JSX.Element {
  return <div>Not found</div>
}

function Brewery (): JSX.Element {
  const { breweryId } = useParams()
  const [mode, setMode] = useState(EditableMode.View)
  const [initialBrewery, setInitialBrewery] =
    useState<BreweryType | undefined>(undefined)
  if (breweryId === undefined) {
    throw new Error('Brewery component without breweryId. Should not happen.')
  }
  const { data: breweryData, isLoading } = useGetBreweryQuery(breweryId)
  const { data: reviewData, isLoading: isLoadingReviews } =
    useListReviewsByBreweryQuery(breweryId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (breweryData?.brewery === undefined) return <NotFound />
  const brewery = breweryData.brewery
  return (
    <div>
      {mode === EditableMode.View && (
        <div className='FlexRow'>
          <div>
            <h3>
              { brewery.name }
            </h3>
          </div>
          <div>
            <EditButton
              disabled={brewery === undefined}
              onClick={() => {
                setMode(EditableMode.Edit)
                setInitialBrewery({ ...brewery })
              }}
            />
          </div>
        </div>
      )}
      {mode === EditableMode.Edit && initialBrewery !== undefined && (
        <UpdateBrewery
          initialBrewery={initialBrewery}
          onCancel={() => {
            setInitialBrewery(undefined)
            setMode(EditableMode.View)
          }}
          onSaved={() => {
            setMode(EditableMode.View)
          }}
        />
      )}
      <ReviewList
        isLoading={isLoadingReviews}
        isTitleVisible={true}
        reviews={reviewData?.reviews ?? []}
      />
    </div>
  )
}

export default Brewery
