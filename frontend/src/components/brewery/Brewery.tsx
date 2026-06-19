import React, { useState } from 'react'

import type { UseUrlPathParams } from '../util'

import type {
  Brewery as BreweryType,
  GetBreweryIf,
  UpdateBreweryIf,
} from '../../core/brewery/types'
import type { ListReviewsByIf, ReviewIf } from '../../core/review/types'
import type { SearchFieldIf } from '../../core/search/types'
import type { ListStoragesByIf } from '../../core/storage/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'
import LoadingIndicator from '../common/LoadingIndicator'

import Stats from '../stats/Stats'

import UpdateBrewery from './UpdateBrewery'

import '../common/FlexRow.css'
import type { StatsIf } from '../../core/stats/types'
import BreweryStorages from './BreweryStorages'
import ReviewsBy from '../review/ReviewsBy'
import NotFound from '../common/NotFound'

interface Props {
  listReviewsByBreweryIf: ListReviewsByIf
  listStoragesByBreweryIf: ListStoragesByIf
  useUrlPathParams: UseUrlPathParams
  reviewIf: ReviewIf
  getBreweryIf: GetBreweryIf
  searchFieldIf: SearchFieldIf
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
            <h3>{brewery.name}</h3>
          </div>
          <div>
            <EditButton
              disabled={false}
              getLogin={props.reviewIf.login}
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
      <Stats
        statsIf={props.statsIf}
        breweryId={brewery.id}
        locationId={undefined}
        styleId={undefined}
      />
      <BreweryStorages
        breweryId={breweryId}
        listStoragesByBreweryIf={props.listStoragesByBreweryIf}
        getLogin={props.reviewIf.login}
      />
      <ReviewsBy
        id={breweryId}
        listReviewsByIf={props.listReviewsByBreweryIf}
        reviewIf={props.reviewIf}
        searchFieldIf={props.searchFieldIf}
      />
    </div>
  )
}

export default Brewery
