import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLazyListBeersQuery } from '../../store/beer/api'
import { type Beer, type BeerWithIds } from '../../store/beer/types'
import { infiniteScroll, joinSortedNames } from '../util'

import BreweryLinks from '../brewery/BreweryLinks'

import BeerLink from './BeerLink'
import SearchBeer from './SearchBeer'

import './Beers.css'

const pageSize = 20

function Beers (): JSX.Element {
  const navigate = useNavigate()
  const [loadedBeers, setLoadedBeers] = useState<Beer[]>([])
  const [trigger, result] = useLazyListBeersQuery()

  const isLoading = result.isLoading
  const beerData = result.data
  const beerArray = beerData?.beers === undefined
    ? []
    : [...beerData.beers]
  const hasMore = beerArray.length > 0 || result.isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await trigger({
        skip: loadedBeers.length,
        size: pageSize
      })
      if (result.data === undefined) return
      const newBeers = [...loadedBeers, ...result.data.beers]
      setLoadedBeers(newBeers)
    }
    function checkLoad (): void {
      if (!isLoading && hasMore) {
        void loadMore()
      }
    }
    return infiniteScroll(checkLoad)
  }, [loadedBeers, setLoadedBeers, isLoading, hasMore, trigger])

  return (
    <div>
      <h3>Beers</h3>
      <SearchBeer select={(beer: BeerWithIds) => {
        navigate(`/beers/${beer.id}`)
      }} />
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
              {joinSortedNames(beer.styles)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Beers
