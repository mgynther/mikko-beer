import { useEffect, useState } from 'react'

import type {
  Beer,
  BeerWithIds,
  SearchBeerIf
} from '../../core/beer/types'
import type { SearchIf } from '../../core/search/types'

import SearchBox from '../common/SearchBox'

import { joinSortedNames, useDebounce } from '../util'

import './SelectBeer.css'

export interface Props {
  searchBeerIf: SearchBeerIf
  searchIf: SearchIf
  select: (beer: BeerWithIds) => void
}

function SearchBeer (props: Props): JSX.Element {
  const { search, isLoading } = props.searchBeerIf.useSearch()
  const [filter, setFilter] = useState('')
  const debouncedFilter = useDebounce(filter)
  const [results, setResults] = useState<Beer[]>([])

  async function doSearch (filter: string): Promise<void> {
    try {
      const result = await search(filter)
      setResults(result)
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
        searchIf={props.searchIf}
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
