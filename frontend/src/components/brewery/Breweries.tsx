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
import { useLoadMore } from '../internal/common/use-load-more'
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
  const [loadedBreweries, setLoadedBreweries] = useState<Brewery[] | undefined>(
    undefined,
  )
  const { breweryList, list, isLoading, isUninitialized } =
    props.listBreweriesIf.useList()

  const breweryArray =
    breweryList?.breweries === undefined ? [] : [...breweryList.breweries]

  const hasMore = breweryArray.length > 0 || isUninitialized

  const checkLoad = useLoadMore({
    hasMore,
    isLoading,
    items: loadedBreweries,
    loadPage: async (skip: number) =>
      (await list({ skip, size: pageSize })).breweries,
    setItems: setLoadedBreweries,
  })

  // Observing the end of the content reports whether it is in view, so
  // subscribing again once a page has arrived is what loads the next one
  // while the list is still shorter than the window.
  useEffect(
    () => props.listBreweriesIf.infiniteScroll(checkLoad),
    [checkLoad, loadedBreweries, isLoading, hasMore],
  )

  return (
    <div>
      <h3>Breweries</h3>
      <SearchBreweryWithNavi
        navigateIf={props.navigateIf}
        searchBreweryIf={props.searchBreweryIf}
      />
      <ul>
        {(loadedBreweries ?? []).map((brewery: Brewery) => (
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
