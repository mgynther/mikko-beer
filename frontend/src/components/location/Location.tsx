import React, { useState } from 'react'

import type { UseUrlPathParams } from '../util'

import type {
  Location as LocationType,
  GetLocationIf,
  UpdateLocationIf,
} from '../../core/location/types'
import type { SearchFieldIf } from '../../core/search/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'
import LoadingIndicator from '../common/LoadingIndicator'

import UpdateLocation from './UpdateLocation'

import '../common/FlexRow.css'
import NotFound from '../common/NotFound'
import type { StatsIf } from '../../core/stats/types'
import Stats from '../stats/Stats'
import type { ListReviewsByIf, ReviewIf } from '../../core/review/types'
import ReviewsBy from '../review/ReviewsBy'

interface Props {
  listReviewsByLocationIf: ListReviewsByIf
  getLocationIf: GetLocationIf
  reviewIf: ReviewIf
  searchFieldIf: SearchFieldIf
  statsIf: StatsIf
  updateLocationIf: UpdateLocationIf
  useUrlPathParams: UseUrlPathParams
}

function Location(props: Props): React.JSX.Element {
  const { locationId } = props.useUrlPathParams()
  const [mode, setMode] = useState(EditableMode.View)
  const [initialLocation, setInitialLocation] = useState<
    LocationType | undefined
  >(undefined)
  if (locationId === undefined) {
    throw new Error('Location component without locationId. Should not happen.')
  }
  const { location, isLoading } = props.getLocationIf.useGet(locationId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (location === undefined) return <NotFound />
  return (
    <div>
      {mode === EditableMode.View && (
        <div className='FlexRow'>
          <div>
            <h3>{location.name}</h3>
          </div>
          <div>
            <EditButton
              disabled={false}
              getLogin={props.updateLocationIf.login}
              onClick={() => {
                setMode(EditableMode.Edit)
                setInitialLocation({ ...location })
              }}
            />
          </div>
        </div>
      )}
      {mode === EditableMode.Edit && initialLocation !== undefined && (
        <UpdateLocation
          updateLocationIf={props.updateLocationIf}
          initialLocation={initialLocation}
          onCancel={() => {
            setInitialLocation(undefined)
            setMode(EditableMode.View)
          }}
          onSaved={() => {
            setMode(EditableMode.View)
          }}
        />
      )}
      <Stats
        statsIf={props.statsIf}
        breweryId={undefined}
        locationId={locationId}
        styleId={undefined}
      />
      <ReviewsBy
        id={locationId}
        listReviewsByIf={props.listReviewsByLocationIf}
        reviewIf={props.reviewIf}
        searchFieldIf={props.searchFieldIf}
      />
    </div>
  )
}

export default Location
