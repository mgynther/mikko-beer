import type { NavigateIf } from '../types/types'
import React, { useEffect, useState } from 'react'

import type {
  Brewery,
  ListBreweriesIf,
  SearchBreweryIf,
} from '../types/brewery/types'

import { nameWithFlag } from '../internal/common/name-with-flag'
import LoadingIndicator from '../internal/common/LoadingIndicator'

import { breweryLinkFormatter } from '../internal/brewery/BreweryLinks'
import SearchBreweryWithNavi from '../internal/brewery/SearchBreweryWithNavi'
import type { LinkComponent } from '../common/link'

const pageSize = 20

export interface Props {
  linkComponent: LinkComponent
  listBreweriesIf: ListBreweriesIf
  navigateIf: NavigateIf
  searchBreweryIf: SearchBreweryIf
}

function Breweries(props: Props): React.JSX.Element {
  const Link = props.linkComponent
  const [loadedBreweries, setLoadedBreweries] = useState<Brewery[]>([])
  const { breweryList, list, isLoading, isUninitialized } =
    props.listBreweriesIf.useList()

  const breweryArray =
    breweryList?.breweries === undefined ? [] : [...breweryList.breweries]

  const hasMore = breweryArray.length > 0 || isUninitialized
  const loadedCount = loadedBreweries.length

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await list({
        skip: loadedCount,
        size: pageSize,
      })
      const newBreweries = [...loadedBreweries, ...result.breweries]
      setLoadedBreweries(newBreweries)
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
    return props.listBreweriesIf.infiniteScroll(checkLoad)
  }, [loadedCount, isLoading, hasMore])

  return (
    <div>
      <h3>Breweries</h3>
      <SearchBreweryWithNavi
        navigateIf={props.navigateIf}
        searchBreweryIf={props.searchBreweryIf}
      />
      <ul>
        {loadedBreweries.map((brewery: Brewery) => (
          <li key={brewery.id}>
            <Link
              to={breweryLinkFormatter(brewery.id)}
              text={nameWithFlag(brewery.name, brewery.country)}
            />
          </li>
        ))}
      </ul>
      <LoadingIndicator isLoading={isLoading} />
    </div>
  )
}

export default Breweries
