import React, { useEffect, useState } from 'react'

import type { Brewery, SearchBreweryIf } from '../../core/brewery/types'

import SearchBox, { nameFormatter } from '../common/SearchBox'

export interface Props {
  searchBreweryIf: SearchBreweryIf
  select: (brewery: Brewery) => void
}

function SearchBrewery(props: Props): React.JSX.Element {
  const { search, isLoading } = props.searchBreweryIf.useSearch()
  const [filter, setFilter] = useState('')
  const [debouncedFilter] =
    props.searchBreweryIf.searchFieldIf.useDebounce(filter)
  const [results, setResults] = useState<Brewery[]>([])

  async function doSearch(filter: string): Promise<void> {
    const results = await search(filter)
    setResults(results)
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
        customSort={undefined}
        formatter={nameFormatter}
        isLoading={isLoading}
        searchFieldIf={props.searchBreweryIf.searchFieldIf}
        setFilter={(filter: string) => {
          setFilter(filter)
        }}
        select={(brewery: Brewery) => {
          props.select(brewery)
        }}
        title={'Search brewery'}
      />
    </>
  )
}

export default SearchBrewery
