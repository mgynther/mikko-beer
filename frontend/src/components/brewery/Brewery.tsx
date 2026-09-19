import React, { useState } from 'react'

import type { UseUrlPathParams } from '../types/types'

import type {
  Brewery as BreweryType,
  GetBreweryIf,
  UpdateBreweryIf,
} from '../types/brewery/types'
import type { ListReviewsByIf } from '../types/review/types'
import type { ListStoragesByIf } from '../types/storage/types'

import { EditableMode } from '../internal/common/EditableMode'
import Flag from '../internal/common/Flag'
import EditButton from '../internal/common/EditButton'
import LoadingIndicator from '../internal/common/LoadingIndicator'

import Stats from '../stats/Stats'

import UpdateBrewery from '../internal/brewery/UpdateBrewery'

import '../common/FlexRow.css'
import type { StatsIf } from '../types/stats/types'
import BreweryStorages from '../internal/brewery/BreweryStorages'
import ReviewsBy from '../internal/review/ReviewsBy'
import NotFound from '../internal/common/NotFound'
import type { LinkComponent } from '../common/link'

interface Props {
  linkComponent: LinkComponent
  listReviewsByBreweryIf: ListReviewsByIf
  listStoragesByBreweryIf: ListStoragesByIf
  useUrlPathParams: UseUrlPathParams
  getBreweryIf: GetBreweryIf
  updateBreweryIf: UpdateBreweryIf
  statsIf: StatsIf
}

function Brewery(props: Props): React.JSX.Element {
  const { breweryId } = props.useUrlPathParams()
  const [mode, setMode] = useState(EditableMode.View)
  const [initialBrewery, setInitialBrewery] = useState<BreweryType | undefined>(
    undefined,
  )
  if (breweryId === undefined) {
    throw new Error('Brewery component without breweryId. Should not happen.')
  }
  const { brewery, isLoading } = props.getBreweryIf.useGet(breweryId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (brewery === undefined) return <NotFound />
  return (
    <div>
      {mode === EditableMode.View && (
        <div className='FlexRow'>
          <div>
            <h3>
              {brewery.name} <Flag country={brewery.country} />
            </h3>
          </div>
          <div>
            <EditButton
              disabled={false}
              getLogin={props.updateBreweryIf.getLogin}
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
          updateBreweryHookIf={{
            useUpdate: props.updateBreweryIf.useUpdate,
          }}
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
      <Stats
        linkComponent={props.linkComponent}
        statsIf={props.statsIf}
        breweryId={brewery.id}
        locationId={undefined}
        styleId={undefined}
      />
      <BreweryStorages
        linkComponent={props.linkComponent}
        breweryId={breweryId}
        listStoragesByBreweryIf={props.listStoragesByBreweryIf}
      />
      <ReviewsBy
        linkComponent={props.linkComponent}
        id={breweryId}
        listReviewsByIf={props.listReviewsByBreweryIf}
      />
    </div>
  )
}

export default Brewery
