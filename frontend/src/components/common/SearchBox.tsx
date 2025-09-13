import React, { useRef } from 'react'

import Button from './Button'
import LoadingIndicator from './LoadingIndicator'

import './SearchBox.css'
import type { SearchIf } from '../../core/search/types'

export interface SearchBoxItem {
  id: string
  name: string
}

export const nameFormatter = (item: SearchBoxItem): string => item.name

export interface Props<T extends SearchBoxItem> {
  searchIf: SearchIf
  currentFilter: string
  currentOptions: T[]
  customSort: ((a: T, b: T) => number) | undefined
  formatter: (item: T) => string
  isLoading: boolean
  setFilter: (filter: string) => void
  select: (item: T) => void
  title: string
}

const maxResultCount = 10

const SearchBox = <T extends SearchBoxItem>({
  currentFilter,
  currentOptions,
  customSort,
  formatter,
  isLoading,
  searchIf,
  setFilter,
  select,
  title
}: Props<T>): React.JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { activate, isActive } = searchIf.useSearch()
  const sortedOptions = [...currentOptions].sort((a, b) => {
    if (customSort !== undefined) {
      const result = customSort(a, b)
      if (result !== 0) {
        return result
      }
    }
    const filter = currentFilter.toLowerCase()
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    if (aName === bName) return 0
    if (aName === filter) return -1
    if (bName === filter) return 1
    const startsWithA = aName.startsWith(filter)
    const startsWithB = bName.startsWith(filter)
    if (startsWithA && !startsWithB) return -1
    if (!startsWithA && startsWithB) return 1
    return aName.localeCompare(bName)
  })
  const visibleOptions = currentFilter.length === 0
    ? []
    : sortedOptions.slice(0, maxResultCount)
  const areAllShown = visibleOptions.length === sortedOptions.length
  const hasMoreResults = !isLoading && !areAllShown
  const hasNoResults = !isLoading && visibleOptions.length === 0
  return (
    <div className='SearchBox'>
      <input
        placeholder={title}
        type='text'
        value={currentFilter}
        ref={inputRef}
        onChange={e => {
          setFilter(e.target.value)
          activate()
        }}
        onFocus={() => {
          activate()
        }}
      />
      <Button
        onClick={() => {
          setFilter('')
          inputRef.current?.focus()
        }}
        text='X'
      />
      {currentFilter.length > 0 && isActive && (
        <div className='SearchResults'>
          <ul>
            {visibleOptions.map(item => (
              <li key={item.id} >
                <Button
                  onClick={() => {
                    select(item)
                    setFilter('')
                  }}
                  text={formatter(item)}
                />
              </li>
            ))}
            {visibleOptions.length === 0 && (
              <div className="SearchInfo">
                {hasNoResults &&
                  <div>No results</div>
                }
                <LoadingIndicator isLoading={isLoading} />
              </div>
            )}
            {visibleOptions.length > 0 && (
              <div className={`SearchInfoContainer ${
                    hasMoreResults || isLoading
                      ? 'shown'
                      : ''}`}>
                <hr/>
                <div className="SearchInfo">
                  {hasMoreResults &&
                    <div>
                      There are more results. Refine search...
                    </div>
                  }
                  <LoadingIndicator isLoading={isLoading} />
                </div>
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SearchBox
