import React, { useEffect, useState } from 'react'

import type {
  Brewery,
  SearchBreweryIf
} from '../../core/brewery/types'
import type { SearchIf } from '../../core/search/types'

import SearchBox, { nameFormatter } from '../common/SearchBox'

export interface Props {
  searchBreweryIf: SearchBreweryIf
  searchIf: SearchIf
  select: (brewery: Brewery) => void
}

function SearchBrewery (props: Props): React.JSX.Element {
  const {
    search,
    isLoading
  } = props.searchBreweryIf.useSearch()
  const [filter, setFilter] = useState('')
  const debouncedFilter = props.searchIf.useDebounce(filter)
  const [results, setResults] = useState<Brewery[]>([])

  async function doSearch (filter: string): Promise<void> {
    try {
      const results = await search(filter)
      setResults(results)
    } catch (e) {
      console.warn('Failed to search breweries', e)
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
    <>
      <SearchBox
        currentFilter={filter}
        currentOptions={results}
        formatter={nameFormatter}
        isLoading={isLoading}
        searchIf={props.searchIf}
        setFilter={(filter: string) => { setFilter(filter) }}
        select={(brewery: Brewery) => {
          props.select(brewery)
        }}
        title={'Search brewery'}
      />
    </>
  )
}

export default SearchBrewery
