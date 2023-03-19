import { useState } from 'react'

import { useListBreweriesQuery } from '../store/brewery/api'
import { type Brewery } from '../store/brewery/types'

import SearchBox, { type SearchBoxItem } from './SearchBox'

export interface Props {
  select: (brewery: Brewery) => void
}

function SearchBrewery (props: Props): JSX.Element {
  const { data: breweryData, isLoading } = useListBreweriesQuery()
  const [filter, setFilter] = useState('')

  const filterParts = filter.trim().toLowerCase().split(' ')
  const filteredBreweries = breweryData?.breweries.filter(brewery => {
    const name = brewery.name.toLowerCase()
    for (const part of filterParts) {
      if (!name.includes(part)) return false
    }
    return true
  }) ?? []

  return (
    <div>
      <SearchBox
        currentFilter={filter}
        currentOptions={filteredBreweries}
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
