import React, { useState } from 'react'

import type { UseUrlPathParams } from '../types/types'

import type {
  GetBeerIf,
  Beer as BeerType,
  UpdateBeerLoginIf,
} from '../types/beer/types'

import type { ListReviewsByIf } from '../types/review/types'
import type { ListStoragesByIf } from '../types/storage/types'

import { EditableMode } from '../internal/common/EditableMode'
import EditButton from '../internal/common/EditButton'

import BreweryLinks from '../internal/brewery/BreweryLinks'
import LoadingIndicator from '../internal/common/LoadingIndicator'
import NotFound from '../internal/common/NotFound'
import StyleLinks from '../internal/style/StyleLinks'

import UpdateBeer from '../internal/beer/UpdateBeer'

import './Beer.css'
import BeerStorages from '../internal/beer/BeerStorages'
import ReviewsBy from '../internal/review/ReviewsBy'
import type { LinkComponent } from '../common/link'

interface Props {
  linkComponent: LinkComponent
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
              <BreweryLinks
                linkComponent={props.linkComponent}
                breweries={beer.breweries}
              />
            </div>
          </div>
          <div className='BeerInfo'>
            <h5>Styles</h5>
            <div>
              <StyleLinks
                linkComponent={props.linkComponent}
                styles={beer.styles}
              />
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
        linkComponent={props.linkComponent}
        beerId={beerId}
        listStoragesByBeerIf={props.listStoragesByBeerIf}
      />
      <ReviewsBy
        linkComponent={props.linkComponent}
        id={beerId}
        listReviewsByIf={props.listReviewsByBeerIf}
      />
    </div>
  )
}

export default Beer
