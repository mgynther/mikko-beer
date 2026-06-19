import React, { useEffect, useState } from 'react'

import type { Beer, BeerWithIds, SearchBeerIf } from '../../core/beer/types'

import SearchBox from '../common/SearchBox'

import { joinSortedNames } from '../util'

import './SelectBeer.css'

export interface Props {
  searchBeerIf: SearchBeerIf
  select: (beer: BeerWithIds) => void
}

function SearchBeer(props: Props): React.JSX.Element {
  const { search, isLoading } = props.searchBeerIf.useSearch()
  const [filter, setFilter] = useState('')
  const [debouncedFilter] = props.searchBeerIf.searchFieldIf.useDebounce(filter)
  const [results, setResults] = useState<Beer[]>([])

  async function doSearch(filter: string): Promise<void> {
    const result = await search(filter)
    setResults(result)
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
        customSort={undefined}
        formatter={(beer: Beer) => {
          const breweryStr = joinSortedNames(beer.breweries)
          return `${beer.name} (${breweryStr})`
        }}
        isLoading={isLoading}
        searchFieldIf={props.searchBeerIf.searchFieldIf}
        setFilter={(filter: string) => {
          setFilter(filter)
        }}
        select={(beer: Beer) => {
          props.select({
            id: beer.id,
            name: beer.name,
            breweries: beer.breweries.map((b) => b.id),
            styles: beer.styles.map((s) => s.id),
          })
        }}
        title={'Search beer'}
      />
    </div>
  )
}

export default SearchBeer
