import type { NavigateIf } from '../types/types'
import React, { useEffect, useState } from 'react'

import type { Beer, ListBeersIf, SearchBeerIf } from '../types/beer/types'
import type { SearchFieldIf } from '../types/search/types'

import BreweryLinks from '../internal/brewery/BreweryLinks'
import StyleLinks from '../internal/style/StyleLinks'

import BeerLink from '../internal/beer/BeerLink'
import SearchBeerWithNavi from '../internal/beer/SearchBeerWithNavi'

import './Beers.css'
import type { LinkComponent } from '../common/link'

const pageSize = 20

interface Props {
  linkComponent: LinkComponent
  listBeersIf: ListBeersIf
  navigateIf: NavigateIf
  searchBeerIf: SearchBeerIf
  searchFieldIf: SearchFieldIf
}

function Beers(props: Props): React.JSX.Element {
  const [loadedBeers, setLoadedBeers] = useState<Beer[]>([])
  const { beerList, list, isLoading, isUninitialized } =
    props.listBeersIf.useList()

  const beerArray = beerList?.beers === undefined ? [] : [...beerList.beers]
  const hasMore = beerArray.length > 0 || isUninitialized
  const loadedCount = loadedBeers.length

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await list({
        skip: loadedCount,
        size: pageSize,
      })
      const newBeers = [...loadedBeers, ...result.beers]
      setLoadedBeers(newBeers)
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
    return props.listBeersIf.infiniteScroll(checkLoad)
  }, [loadedCount, isLoading, hasMore])

  return (
    <div>
      <h3>Beers</h3>
      <SearchBeerWithNavi
        navigateIf={props.navigateIf}
        searchBeerIf={props.searchBeerIf}
      />
      {isLoading && <div>Loading...</div>}
      <div className='BeerHeading'>
        <div className='BeerName'>Name</div>
        <div className='BeerBreweries'>Breweries</div>
        <div className='BeerStyles'>Styles</div>
      </div>
      <div>
        {loadedBeers.map((beer: Beer) => (
          <div className='BeerRow RowLike' key={beer.id}>
            <div className='BeerName'>
              <BeerLink linkComponent={props.linkComponent} beer={beer} />
            </div>
            <div className='BeerBreweries'>
              <BreweryLinks
                linkComponent={props.linkComponent}
                breweries={beer.breweries}
              />
            </div>
            <div className='BeerStyles'>
              <StyleLinks
                linkComponent={props.linkComponent}
                styles={beer.styles}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Beers
