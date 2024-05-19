import { useState } from 'react'

import { useParams } from 'react-router-dom'

import { useGetBeerQuery } from '../../store/beer/api'
import { type Beer as BeerType } from '../../store/beer/types'
import { useListReviewsByBeerQuery } from '../../store/review/api'
import {
  type ReviewSorting,
  type ReviewSortingOrder
} from '../../store/review/types'
import { useListStoragesByBeerQuery } from '../../store/storage/api'
import { type ListDirection } from '../../store/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'

import BreweryLinks from '../brewery/BreweryLinks'
import LoadingIndicator from '../common/LoadingIndicator'
import ReviewList from '../review/ReviewList'
import StorageList from '../storage/StorageList'
import StyleLinks from '../style/StyleLinks'

import UpdateBeer from './UpdateBeer'

import './Beer.css'

function NotFound (): JSX.Element {
  return <div>Not found</div>
}

function Beer (): JSX.Element {
  const { beerId } = useParams()
  const [order, doSetOrder] = useState<ReviewSortingOrder>('beer_name')
  const [direction, doSetDirection] = useState<ListDirection>('asc')
  const [mode, setMode] = useState(EditableMode.View)
  const [initialBeer, setInitialBeer] =
    useState<BeerType | undefined>(undefined)
  if (beerId === undefined) {
    throw new Error('Beer component without beerId. Should not happen.')
  }
  const { data: beerData, isLoading } = useGetBeerQuery(beerId)
  const { data: reviewData, isLoading: isLoadingReviews } =
    useListReviewsByBeerQuery({
      id: beerId,
      sorting: {
        order,
        direction
      }
    })
  const { data: storageData } = useListStoragesByBeerQuery(beerId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (beerData?.beer === undefined) return <NotFound />
  const beer = beerData.beer
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
                disabled={beerData.beer === undefined}
                onClick={() => {
                  setMode(EditableMode.Edit)
                  setInitialBeer({ ...beerData.beer })
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
      {(storageData?.storages ?? []).length > 0 && (
        <StorageList
          isLoading={isLoadingReviews}
          isTitleVisible={true}
          storages={storageData?.storages ?? []}
        />
      )}
      <ReviewList
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

export default Beer
