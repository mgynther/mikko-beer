import React, { useEffect, useState } from 'react'
import { Link } from '../common/Link'

import type {
  Brewery,
  ListBreweriesIf,
  SearchBreweryIf,
} from '../../core/brewery/types'
import type { SearchIf } from '../../core/search/types'

import type { NavigateIf } from '../util'

import LoadingIndicator from '../common/LoadingIndicator'

import { breweryLinkFormatter } from './BreweryLinks'
import SearchBreweryWithNavi from './SearchBreweryWithNavi'

const pageSize = 20

export interface Props {
  listBreweriesIf: ListBreweriesIf
  navigateIf: NavigateIf
  searchBreweryIf: SearchBreweryIf
  searchIf: SearchIf
}

function Breweries(props: Props): React.JSX.Element {
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
        searchIf={props.searchIf}
      />
      <ul>
        {loadedBreweries.map((brewery: Brewery) => (
          <li key={brewery.id}>
            <Link to={breweryLinkFormatter(brewery.id)} text={brewery.name} />
          </li>
        ))}
      </ul>
      <LoadingIndicator isLoading={isLoading} />
    </div>
  )
}

export default Breweries
