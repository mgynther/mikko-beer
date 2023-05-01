import { useEffect, useState } from 'react'

import { useLazySearchBreweriesQuery } from '../store/brewery/api'
import { type Brewery } from '../store/brewery/types'

import SearchBox, { type SearchBoxItem } from './SearchBox'

import { useDebounce } from './util'

export interface Props {
  select: (brewery: Brewery) => void
}

function SearchBrewery (props: Props): JSX.Element {
  const [
    searchBrewery,
    { isLoading }
  ] = useLazySearchBreweriesQuery()
  const [filter, setFilter] = useState('')
  const debouncedFilter = useDebounce(filter, 200)
  const [results, setResults] = useState<Brewery[]>([])

  async function doSearch (filter: string): Promise<void> {
    try {
      const result = await searchBrewery(filter).unwrap()
      setResults(result.breweries)
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
    <div>
      <SearchBox
        currentFilter={filter}
        currentOptions={results}
        isLoading={isLoading}
        setFilter={(filter: string) => { setFilter(filter) }}
        select={(brewery: SearchBoxItem) => {
          props.select(brewery as Brewery)
        }}
        title={'Search brewery'}
      />
    </div>
  )
}

export default SearchBrewery
