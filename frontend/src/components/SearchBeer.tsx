import { useState } from 'react'

import { useListBeersQuery } from '../store/beer/api'
import { type Beer, type BeerWithIds } from '../store/beer/types'

import SearchBox, { type SearchBoxItem } from './SearchBox'

import './SelectBeer.css'

export interface Props {
  select: (beer: BeerWithIds) => void
}

function SearchBeer (props: Props): JSX.Element {
  const { data: beerData, isLoading } =
    useListBeersQuery({ size: 10000, skip: 0 })
  const [filter, setFilter] = useState('')

  const filterParts = filter.trim().toLowerCase().split(' ')
  const filteredBeers = beerData?.beers.filter(beer => {
    const name = beer.name.toLowerCase()
    for (const part of filterParts) {
      if (!name.includes(part)) return false
    }
    return true
  }) ?? []

  return (
    <div>
      <SearchBox
        currentFilter={filter}
        currentOptions={filteredBeers}
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
