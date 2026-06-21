import React, { useState } from 'react'

import type { UseUrlPathParams } from '../util'

import type {
  GetBeerIf,
  Beer as BeerType,
  UpdateBeerLoginIf,
} from '../../core/beer/types'

import type { ListReviewsByIf } from '../../core/review/types'
import type { ListStoragesByIf } from '../../core/storage/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'

import BreweryLinks from '../brewery/BreweryLinks'
import LoadingIndicator from '../common/LoadingIndicator'
import NotFound from '../common/NotFound'
import StyleLinks from '../style/StyleLinks'

import UpdateBeer from './UpdateBeer'

import './Beer.css'
import BeerStorages from './BeerStorages'
import ReviewsBy from '../review/ReviewsBy'

interface Props {
  listReviewsByBeerIf: ListReviewsByIf
  listStoragesByBeerIf: ListStoragesByIf
  useUrlPathParams: UseUrlPathParams
  updateBeerLoginIf: UpdateBeerLoginIf
  getBeerIf: GetBeerIf
}

function Beer(props: Props): React.JSX.Element {
  const { beerId } = props.useUrlPathParams()
  const [mode, setMode] = useState(EditableMode.View)
  const [initialBeer, setInitialBeer] = useState<BeerType | undefined>(
    undefined,
  )
  if (beerId === undefined) {
    throw new Error('Beer component without beerId. Should not happen.')
  }
  const { beer, isLoading } = props.getBeerIf.useGetBeer(beerId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (beer === undefined) return <NotFound />
  return (
    <div className='Beer'>
      {mode === EditableMode.View && (
        <>
          <div className='FlexRow'>
            <div>
              <h3>{beer.name}</h3>
            </div>
            <div>
              <EditButton
                disabled={false}
                getLogin={props.updateBeerLoginIf.getLogin}
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
          updateBeerIf={{
            useUpdate: props.updateBeerLoginIf.useUpdate,
            editBeerIf: props.updateBeerLoginIf.editBeerIf,
          }}
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
      <BeerStorages
        beerId={beerId}
        listStoragesByBeerIf={props.listStoragesByBeerIf}
      />
      <ReviewsBy id={beerId} listReviewsByIf={props.listReviewsByBeerIf} />
    </div>
  )
}

export default Beer
