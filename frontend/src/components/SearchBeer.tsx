import { useState } from 'react'

import { useListBeersQuery } from '../store/beer/api'
import { type Beer } from '../store/beer/types'

import SearchBox, { type SearchBoxItem } from './SearchBox'

import './SelectBeer.css'

export interface Props {
  select: (beer: Beer) => void
}

function SearchBeer (props: Props): JSX.Element {
  const { data: beerData, isLoading } = useListBeersQuery()
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
        select={(beer: SearchBoxItem) => { props.select(beer as Beer) }}
        title={'Search beer'}
      />
    </div>
  )
}

export default SearchBeer
