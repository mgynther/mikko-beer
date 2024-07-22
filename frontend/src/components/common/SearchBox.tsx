import { useRef } from 'react'

import LoadingIndicator from './LoadingIndicator'

import './SearchBox.css'
import { SearchIf } from '../../core/search/types'

export interface SearchBoxItem {
  id: string
  name: string
}

export const nameFormatter = (item: SearchBoxItem): string => item.name

export interface Props<T extends SearchBoxItem> {
  searchIf: SearchIf
  currentFilter: string
  currentOptions: T[]
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
  formatter,
  isLoading,
  searchIf,
  setFilter,
  select,
  title
}: Props<T>): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { activate, isActive } = searchIf.useSearch()
  const sortedOptions = [...currentOptions].sort((a, b) => {
    const filter = currentFilter.toLowerCase()
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    if (aName === bName) return 0
    if (aName === filter) return -1
    if (bName === filter) return 1
    return aName.localeCompare(bName)
  })
  const visibleOptions = currentFilter.length === 0 ||
    isLoading
    ? []
    : sortedOptions.slice(0, maxResultCount)
  const areAllShown = visibleOptions.length === sortedOptions.length
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
      <button onClick={() => {
        setFilter('')
        inputRef.current?.focus()
      }}>X</button>
      {currentFilter.length > 0 && isActive && (
        <div className='SearchResults'>
          <ul>
            {!isLoading && visibleOptions.map(item => (
              <li key={item.id} >
                <button
                  onClick={() => {
                    select(item)
                    setFilter('')
                  }}
                >
                  {formatter(item)}
                </button>
              </li>
            ))}
            <div className='SearchInfo'>
              {!isLoading && !areAllShown &&
                <>
                  <hr/>
                  <div>
                    There are more results. Refine search...
                  </div>
                </>
              }
              {!isLoading &&
                visibleOptions.length === 0 &&
                <div>No results</div>
              }
              <LoadingIndicator isLoading={isLoading} />
            </div>
          </ul>
        </div>
      )}
    </div>
  )
}

export default SearchBox
