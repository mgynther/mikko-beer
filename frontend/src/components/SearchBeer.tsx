import { useEffect, useState } from 'react'

import { useLazySearchBeersQuery } from '../store/beer/api'
import { type Beer, type BeerWithIds } from '../store/beer/types'

import SearchBox, { type SearchBoxItem } from './SearchBox'

import { useDebounce } from './util'

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
        isLoading={isLoading}
        setFilter={(filter: string) => { setFilter(filter) }}
        select={(beer: SearchBoxItem) => {
          // TODO a generic search would be better than type assertion which
          // will fail silently.
          const typedBeer: Beer = beer as Beer
          props.select({
            id: typedBeer.id,
            name: typedBeer.name,
            breweries: typedBeer.breweries.map(b => b.id),
            styles: typedBeer.styles.map(s => s.id)
          })
        }}
        title={'Search beer'}
      />
    </div>
  )
}

export default SearchBeer
