import React, { useEffect, useState } from 'react'

import type {
  Location,
  SearchLocationIf
} from '../../core/location/types'
import type { SearchIf } from '../../core/search/types'

import SearchBox, { nameFormatter } from '../common/SearchBox'

export interface Props {
  isCreateEnabled: boolean
  placeholderText: string
  searchLocationIf: SearchLocationIf
  searchIf: SearchIf
  select: (location: Location) => void
}

const createId = 'create-new'

function SearchLocation (props: Props): React.JSX.Element {
  const {
    search,
    isLoading
  } = props.searchLocationIf.useSearch()
  const [filter, setFilter] = useState('')
  const debouncedFilter = props.searchIf.useDebounce(filter)
  const [results, setResults] = useState<Location[]>([])

  const { create } = props.searchLocationIf.create.useCreate()

  async function doSearch (filter: string): Promise<void> {
    try {
      const results = await search(filter)
      setResults(results)
    } catch (e) {
      console.warn('Failed to search locations', e)
    }
  }

  useEffect(() => {
    if (debouncedFilter === '') {
      setResults([])
      return
    }
    void doSearch(debouncedFilter)
  }, [debouncedFilter])

  const hasCurrentFilter = results.some(
    result => result.name.toLowerCase() === filter.toLowerCase()
  )
  const resultsAndCreate = [...results]
  if (!isLoading &&
      props.isCreateEnabled &&
      debouncedFilter.length > 0 &&
      !hasCurrentFilter) {
    resultsAndCreate.push({
      id: createId,
      name: `Create "${debouncedFilter}"`
    })
  }

  return (
    <>
      <SearchBox
        currentFilter={filter}
        currentOptions={resultsAndCreate}
        formatter={nameFormatter}
        isLoading={isLoading}
        searchIf={props.searchIf}
        setFilter={(filter: string) => { setFilter(filter) }}
        select={(location: Location) => {
          if (location.id === createId) {
            void create({ name: debouncedFilter })
            return
          }
          props.select(location)
        }}
        title={props.placeholderText}
      />
    </>
  )
}

export default SearchLocation
