import React, { useEffect, useState } from 'react'

import type {
  Location,
  ListLocationsIf,
  SearchLocationIf
} from '../../core/location/types'
import type { SearchIf } from '../../core/search/types'

import type { NavigateIf } from '../util'

import LoadingIndicator from '../common/LoadingIndicator'

import LocationLink from './LocationLink'
import SearchLocationWithNavi from './SearchLocationWithNavi'

const pageSize = 20

export interface Props {
  listLocationsIf: ListLocationsIf
  navigateIf: NavigateIf
  searchLocationIf: SearchLocationIf
  searchIf: SearchIf
}

function Locations (props: Props): React.JSX.Element {
  const [loadedLocations, setLoadedLocations] = useState<Location[]>([])
  const { locationList, list, isLoading, isUninitialized } =
    props.listLocationsIf.useList()

  const locationArray = locationList?.locations === undefined
    ? []
    : [...locationList.locations]

  const hasMore = locationArray.length > 0 || isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await list({
        skip: loadedLocations.length,
        size: pageSize
      })
      const newLocations = [...loadedLocations, ...result.locations]
      setLoadedLocations(newLocations)
    }
    function checkLoad (): void {
      if (!isLoading && hasMore) {
        void loadMore()
      }
    }
    return props.listLocationsIf.infiniteScroll(checkLoad)
  }, [loadedLocations, setLoadedLocations, isLoading, hasMore, list])

  return (
    <div>
      <h3>Locations</h3>
      <LoadingIndicator isLoading={isLoading} />
      <SearchLocationWithNavi
        navigateIf={props.navigateIf}
        searchLocationIf={props.searchLocationIf}
        searchIf={props.searchIf}
      />
      <ul>
        {loadedLocations.map((location: Location) => (
          <li key={location.id}>
            <LocationLink
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
