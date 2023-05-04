import { useEffect, useState } from 'react'

import { useLazySearchBeersQuery } from '../store/beer/api'
import { type Beer, type BeerWithIds } from '../store/beer/types'

import SearchBox from './SearchBox'

import { joinSortedNames, useDebounce } from './util'

import './SelectBeer.css'

export interface Props {
  select: (beer: BeerWithIds) => void
}

function SearchBeer (props: Props): JSX.Element {
  const [
    searchBeers,
    { isLoading }
  ] = useLazySearchBeersQuery()
  const [filter, setFilter] = useState('')
  const debouncedFilter = useDebounce(filter, 200)
  const [results, setResults] = useState<Beer[]>([])

  async function doSearch (filter: string): Promise<void> {
    try {
      const result = await searchBeers(filter).unwrap()
      setResults(result.beers)
    } catch (e) {
      console.warn('Failed to search beers', e)
    }
  }

  useEffect(() => {
    if (debouncedFilter === '') {
      setResults([])
      return
    }
    void doSearch(debouncedFilter)
  }, [debouncedFilter])

  return (
    <div>
      <SearchBox
        currentFilter={filter}
        currentOptions={results}
        formatter={(beer: Beer) => {
          const breweryStr = joinSortedNames(beer.breweries)
          return `${beer.name} (${breweryStr})`
        }}
        isLoading={isLoading}
        setFilter={(filter: string) => { setFilter(filter) }}
        select={(beer: Beer) => {
          props.select({
            id: beer.id,
            name: beer.name,
            breweries: beer.breweries.map(b => b.id),
            styles: beer.styles.map(s => s.id)
          })
        }}
        title={'Search beer'}
      />
    </div>
  )
}

export default SearchBeer
