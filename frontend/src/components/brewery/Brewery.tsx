import { useState } from 'react'

import { useParams } from 'react-router-dom'

import type {
  Brewery as BreweryType,
  GetBreweryIf,
  UpdateBreweryIf
} from '../../core/brewery/types'
import type {
  ListReviewsByIf,
  ReviewIf,
  ReviewSorting,
  ReviewSortingOrder
} from '../../core/review/types'
import type { ListStoragesByIf } from '../../core/storage/types'
import type { ListDirection } from '../../core/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'
import LoadingIndicator from '../common/LoadingIndicator'
import ReviewList from '../review/ReviewList'
import StorageList from '../storage/StorageList'

import Stats from '../stats/Stats'

import UpdateBrewery from './UpdateBrewery'

import '../common/FlexRow.css'
import type { StatsIf } from '../../core/stats/types'

function NotFound (): JSX.Element {
  return <div>Not found</div>
}

interface Props {
  listReviewsByBreweryIf: ListReviewsByIf
  listStoragesByBreweryIf: ListStoragesByIf
  reviewIf: ReviewIf
  getBreweryIf: GetBreweryIf
  updateBreweryIf: UpdateBreweryIf
  statsIf: StatsIf
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
  const { reviews, isLoading: isLoadingReviews } =
    props.listReviewsByBreweryIf.useList({
      id: breweryId,
      sorting: {
        order,
        direction
      }
    })
  const { storages, isLoading: isLoadingStorages } =
    props.listStoragesByBreweryIf.useList(breweryId)
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
                getLogin={props.reviewIf.login}
                onClick={() => {
                  setMode(EditableMode.Edit)
                  setInitialBrewery({ ...brewery })
                }}
              />
            </div>
          </div>
          <Stats
            statsIf={props.statsIf}
            breweryId={brewery.id}
            styleId={undefined}
          />
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
      {(storages?.storages ?? []).length > 0 && (
        <StorageList
          getLogin={props.reviewIf.login}
          isLoading={isLoadingStorages}
          isTitleVisible={true}
          storages={storages?.storages ?? []}
        />
      )}
      <ReviewList
        reviewIf={props.reviewIf}
        isLoading={isLoadingReviews}
        isTitleVisible={true}
        reviews={reviews?.reviews ?? []}
        sorting={reviews?.sorting}
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
