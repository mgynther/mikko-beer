import { useEffect, useState } from 'react'
import { Link } from '../common/Link'

import type {
  Brewery,
  ListBreweriesIf,
  SearchBreweryIf
} from '../../core/brewery/types'
import type { SearchIf } from '../../core/search/types'

import { infiniteScroll, type NavigateIf } from '../util'

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

function Breweries (props: Props): JSX.Element {
  const [loadedBreweries, setLoadedBreweries] = useState<Brewery[]>([])
  const { breweryList, list, isLoading, isUninitialized } =
    props.listBreweriesIf.useList()

  const breweryArray = breweryList?.breweries === undefined
    ? []
    : [...breweryList.breweries]

  const hasMore = breweryArray.length > 0 || isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await list({
        skip: loadedBreweries.length,
        size: pageSize
      })
      if (result === undefined) return
      const newBreweries = [...loadedBreweries, ...result.breweries]
      setLoadedBreweries(newBreweries)
    }
    function checkLoad (): void {
      if (!isLoading && hasMore) {
        void loadMore()
      }
    }
    return infiniteScroll(checkLoad)
  }, [loadedBreweries, setLoadedBreweries, isLoading, hasMore, list])

  return (
    <div>
      <h3>Breweries</h3>
      <LoadingIndicator isLoading={isLoading} />
      <SearchBreweryWithNavi
        navigateIf={props.navigateIf}
        searchBreweryIf={props.searchBreweryIf}
        searchIf={props.searchIf}
      />
      <ul>
        {loadedBreweries.map((brewery: Brewery) => (
          <li key={brewery.id}>
            <Link
              to={breweryLinkFormatter(brewery.id)}
              text={brewery.name}
            />
          </li>
        ))}
      </ul>
      <LoadingIndicator isLoading={isLoading} />
    </div>
  )
}

export default Breweries
