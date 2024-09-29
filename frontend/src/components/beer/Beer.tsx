import { useState } from 'react'

import type { ParamsIf } from '../util'

import type {
  GetBeerIf,
  Beer as BeerType,
  UpdateBeerIf
} from '../../core/beer/types'

import type {
  ListReviewsByIf,
  ReviewIf,
  ReviewSorting,
  ReviewSortingOrder
} from '../../core/review/types'
import type { SearchIf } from '../../core/search/types'
import type { ListStoragesByIf } from '../../core/storage/types'
import type { ListDirection } from '../../core/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'

import BreweryLinks from '../brewery/BreweryLinks'
import LoadingIndicator from '../common/LoadingIndicator'
import NotFound from '../common/NotFound'
import ReviewList from '../review/ReviewList'
import StorageList from '../storage/StorageList'
import StyleLinks from '../style/StyleLinks'

import UpdateBeer from './UpdateBeer'

import './Beer.css'

interface Props {
  listReviewsByBeerIf: ListReviewsByIf
  listStoragesByBeerIf: ListStoragesByIf
  paramsIf: ParamsIf
  reviewIf: ReviewIf
  searchIf: SearchIf
  updateBeerIf: UpdateBeerIf
  getBeerIf: GetBeerIf
}

function Beer (props: Props): JSX.Element {
  const { beerId } = props.paramsIf.useParams()
  const [order, doSetOrder] = useState<ReviewSortingOrder>('beer_name')
  const [direction, doSetDirection] = useState<ListDirection>('asc')
  const [mode, setMode] = useState(EditableMode.View)
  const [initialBeer, setInitialBeer] =
    useState<BeerType | undefined>(undefined)
  if (beerId === undefined) {
    throw new Error('Beer component without beerId. Should not happen.')
  }
  const { beer, isLoading } = props.getBeerIf.useGetBeer(beerId)
  const { reviews, isLoading: isLoadingReviews } =
    props.listReviewsByBeerIf.useList({
      id: beerId,
      sorting: {
        order,
        direction
      }
    })
  const { storages, isLoading: isLoadingStorages } =
    props.listStoragesByBeerIf.useList(beerId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (beer === undefined) return <NotFound />
  return (
    <div className='Beer'>
      {mode === EditableMode.View && (
        <>
          <div className='FlexRow'>
            <div>
              <h3>{ beer.name }</h3>
            </div>
            <div>
              <EditButton
                disabled={beer === undefined}
                getLogin={props.reviewIf.login}
                onClick={() => {
                  setMode(EditableMode.Edit)
                  setInitialBeer({ ...beer })
                }}
              />
            </div>
          </div>
          <div className='BeerInfo'>
            <h5>Breweries</h5>
            <div>
              <BreweryLinks breweries={beer.breweries} />
            </div>
          </div>
          <div className='BeerInfo'>
            <h5>Styles</h5>
            <div>
              <StyleLinks styles={beer.styles} />
            </div>
          </div>
        </>
      )}
      {mode === EditableMode.Edit && initialBeer !== undefined && (
        <UpdateBeer
          searchIf={props.searchIf}
          updateBeerIf={props.updateBeerIf}
          initialBeer={initialBeer}
          onCancel={() => {
            setInitialBeer(undefined)
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
        searchIf={props.searchIf}
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

export default Beer
