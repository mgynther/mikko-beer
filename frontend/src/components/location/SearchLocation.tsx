import React, { useEffect, useState } from 'react'

import type {
  Location,
  SearchLocationIf
} from '../../core/location/types'
import type { SearchIf } from '../../core/search/types'

import SearchBox, { nameFormatter } from '../common/SearchBox'

export interface Props {
  getConfirm: () => (text: string) => boolean
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
        customSort={(a: Location, b: Location) => {
          if (a.id === createId) return 1
          if (b.id === createId) return -1
          return 0
        }}
        formatter={nameFormatter}
        isLoading={isLoading}
        searchIf={props.searchIf}
        setFilter={(filter: string) => { setFilter(filter) }}
        select={(location: Location) => {
          if (location.id === createId) {
            const doCreate = async (): Promise<void> => {
              const createdLocation = await create({ name: debouncedFilter })
              props.select(createdLocation)
            }
            if (resultsAndCreate.length > 1) {
              const confirmQuestion =
                `Are you sure you want to create ${debouncedFilter}?`
              if (props.getConfirm()(confirmQuestion)) {
                void doCreate()
              }
              return
            }
            void doCreate()
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
