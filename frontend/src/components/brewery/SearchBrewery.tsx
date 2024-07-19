import { useEffect, useState } from 'react'

import type {
  Brewery,
  SearchBreweryIf
} from '../../core/brewery/types'

import SearchBox, { nameFormatter } from '../common/SearchBox'

import { useDebounce } from '../util'

export interface Props {
  searchBreweryIf: SearchBreweryIf
  select: (brewery: Brewery) => void
}

function SearchBrewery (props: Props): JSX.Element {
  const {
    search,
    isLoading
  } = props.searchBreweryIf.useSearch()
  const [filter, setFilter] = useState('')
  const debouncedFilter = useDebounce(filter)
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
