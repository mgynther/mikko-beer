import type { NavigateIf } from '../types/types'
import React, { useEffect, useState } from 'react'

import type {
  Location,
  ListLocationsIf,
  SearchLocationIf,
} from '../types/location/types'

import LoadingIndicator from '../internal/common/LoadingIndicator'

import LocationLink from '../internal/location/LocationLink'
import SearchLocationWithNavi from '../internal/location/SearchLocationWithNavi'
import type { LinkComponent } from '../common/link'

const pageSize = 20

export interface Props {
  linkComponent: LinkComponent
  listLocationsIf: ListLocationsIf
  navigateIf: NavigateIf
  searchLocationIf: SearchLocationIf
}

function Locations(props: Props): React.JSX.Element {
  const [loadedLocations, setLoadedLocations] = useState<Location[]>([])
  const { locationList, list, isLoading, isUninitialized } =
    props.listLocationsIf.useList()

  const locationArray =
    locationList?.locations === undefined ? [] : [...locationList.locations]

  const hasMore = locationArray.length > 0 || isUninitialized
  const loadedCount = loadedLocations.length

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await list({
        skip: loadedCount,
        size: pageSize,
      })
      const newLocations = [...loadedLocations, ...result.locations]
      setLoadedLocations(newLocations)
    }
    function checkLoad(): void {
      if (isLoading) {
        return
      }
      if (!hasMore) {
        return
      }
      void loadMore()
    }
    return props.listLocationsIf.infiniteScroll(checkLoad)
  }, [loadedCount, isLoading, hasMore])

  return (
    <div>
      <h3>Locations</h3>
      <SearchLocationWithNavi
        navigateIf={props.navigateIf}
        searchLocationIf={props.searchLocationIf}
      />
      <ul>
        {loadedLocations.map((location: Location) => (
          <li key={location.id}>
            <LocationLink
              linkComponent={props.linkComponent}
              location={location}
            />
          </li>
        ))}
      </ul>
      <LoadingIndicator isLoading={isLoading} />
    </div>
  )
}

export default Locations
