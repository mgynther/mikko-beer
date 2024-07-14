import { useState } from 'react'

import { useParams } from 'react-router-dom'

import { useGetBreweryQuery } from '../../store/brewery/api'
import { type Brewery as BreweryType } from '../../store/brewery/types'
import { useListReviewsByBreweryQuery } from '../../store/review/api'
import {
  type ReviewSorting,
  type ReviewSortingOrder
} from '../../store/review/types'
import { useListStoragesByBreweryQuery } from '../../store/storage/api'
import { type ListDirection } from '../../store/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'
import LoadingIndicator from '../common/LoadingIndicator'
import ReviewList from '../review/ReviewList'
import StorageList from '../storage/StorageList'

import Stats from '../stats/Stats'

import UpdateBrewery from './UpdateBrewery'

import '../common/FlexRow.css'
import { type CreateContainerIf } from '../../core/container/types'

function NotFound (): JSX.Element {
  return <div>Not found</div>
}

interface Props {
  createContainerIf: CreateContainerIf
}

function Brewery (props: Props): JSX.Element {
  const { breweryId } = useParams()
  const [order, doSetOrder] = useState<ReviewSortingOrder>('beer_name')
  const [direction, doSetDirection] = useState<ListDirection>('asc')
  const [mode, setMode] = useState(EditableMode.View)
  const [initialBrewery, setInitialBrewery] =
    useState<BreweryType | undefined>(undefined)
  if (breweryId === undefined) {
    throw new Error('Brewery component without breweryId. Should not happen.')
  }
  const { data: breweryData, isLoading } = useGetBreweryQuery(breweryId)
  const { data: reviewData, isLoading: isLoadingReviews } =
    useListReviewsByBreweryQuery({
      id: breweryId,
      sorting: {
        order,
        direction
      }
    })
  const { data: storageData } = useListStoragesByBreweryQuery(breweryId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (breweryData?.brewery === undefined) return <NotFound />
  const brewery = breweryData.brewery
  return (
    <div>
      {mode === EditableMode.View && (
        <>
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
          <Stats breweryId={brewery.id} styleId={undefined} />
        </>
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
      {(storageData?.storages ?? []).length > 0 && (
        <StorageList
          isLoading={isLoadingReviews}
          isTitleVisible={true}
          storages={storageData?.storages ?? []}
        />
      )}
      <ReviewList
        createContainerIf={props.createContainerIf}
        isLoading={isLoadingReviews}
        isTitleVisible={true}
        reviews={reviewData?.reviews ?? []}
        sorting={reviewData?.sorting}
        setSorting={(sorting: ReviewSorting) => {
          if (order !== sorting.order) {
            doSetOrder(sorting.order)
          }
          if (direction !== sorting.direction) {
            doSetDirection(sorting.direction)
          }
        }}
        supportedSorting={['beer_name', 'brewery_name', 'rating', 'time']}
        onChanged={() => {}}
      />
    </div>
  )
}

export default Brewery
