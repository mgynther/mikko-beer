import { useEffect, useState } from 'react'

import type {
  Beer,
  ListBeersIf,
  SearchBeerIf
} from '../../core/beer/types'
import type { SearchIf } from '../../core/search/types'
import { infiniteScroll } from '../util'

import BreweryLinks from '../brewery/BreweryLinks'
import StyleLinks from '../style/StyleLinks'

import BeerLink from './BeerLink'
import SearchBeerWithNavi from './SearchBeerWithNavi'

import './Beers.css'

const pageSize = 20

interface Props {
  listBeersIf: ListBeersIf
  searchBeerIf: SearchBeerIf
  searchIf: SearchIf
}

function Beers (props: Props): JSX.Element {
  const [loadedBeers, setLoadedBeers] = useState<Beer[]>([])
  const { beerList, list, isLoading, isUninitialized } =
    props.listBeersIf.useList()

  const beerArray = beerList?.beers === undefined
    ? []
    : [...beerList.beers]
  const hasMore = beerArray.length > 0 || isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await list({
        skip: loadedBeers.length,
        size: pageSize
      })
      if (result === undefined) return
      const newBeers = [...loadedBeers, ...result.beers]
      setLoadedBeers(newBeers)
    }
    function checkLoad (): void {
      if (!isLoading && hasMore) {
        void loadMore()
      }
    }
    return infiniteScroll(checkLoad)
  }, [loadedBeers, setLoadedBeers, isLoading, hasMore, list])

  return (
    <div>
      <h3>Beers</h3>
      <SearchBeerWithNavi
        searchIf={props.searchIf}
        searchBeerIf={props.searchBeerIf}
      />
      {isLoading && (<div>Loading...</div>)}
      <div className='BeerHeading'>
          <div className='BeerName'>Name</div>
          <div className='BeerBreweries'>Breweries</div>
          <div className='BeerStyles'>Styles</div>
      </div>
      <div>
        {loadedBeers.map((beer: Beer) => (
          <div className='BeerRow RowLike' key={beer.id}>
            <div className='BeerName'>
              <BeerLink beer={beer} />
            </div>
            <div className='BeerBreweries'>
              <BreweryLinks breweries={beer.breweries} />
            </div>
            <div className='BeerStyles'>
              <StyleLinks styles={beer.styles} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Beers
