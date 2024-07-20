import { useState } from 'react'

import { useParams } from 'react-router-dom'

import type {
  Brewery as BreweryType,
  GetBreweryIf,
  UpdateBreweryIf
} from '../../core/brewery/types'
import { useListReviewsByBreweryQuery } from '../../store/review/api'
import type {
  ReviewSorting,
  ReviewSortingOrder
} from '../../core/review/types'
import { useListStoragesByBreweryQuery } from '../../store/storage/api'
import type { ListDirection } from '../../core/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'
import LoadingIndicator from '../common/LoadingIndicator'
import ReviewList from '../review/ReviewList'
import StorageList from '../storage/StorageList'

import Stats from '../stats/Stats'

import UpdateBrewery from './UpdateBrewery'

import '../common/FlexRow.css'
import type { CreateBeerIf } from '../../core/beer/types'
import type { GetLogin } from '../../core/login/types'
import type { ReviewContainerIf } from '../../core/review/types'

function NotFound (): JSX.Element {
  return <div>Not found</div>
}

interface Props {
  createBeerIf: CreateBeerIf
  getBreweryIf: GetBreweryIf
  updateBreweryIf: UpdateBreweryIf
  getLogin: GetLogin
  reviewContainerIf: ReviewContainerIf
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
  const { brewery, isLoading } = props.getBreweryIf.useGet(breweryId)
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
  if (brewery === undefined) return <NotFound />
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
                getLogin={props.getLogin}
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
          updateBreweryIf={props.updateBreweryIf}
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
          getLogin={props.getLogin}
          isLoading={isLoadingReviews}
          isTitleVisible={true}
          storages={storageData?.storages ?? []}
        />
      )}
      <ReviewList
        createBeerIf={props.createBeerIf}
        getLogin={props.getLogin}
        reviewContainerIf={props.reviewContainerIf}
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
