import { useId, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { activate, selectActiveSearch } from '../../store/search/reducer'

import LoadingIndicator from './LoadingIndicator'

import './SearchBox.css'

export interface SearchBoxItem {
  id: string
  name: string
}

export const nameFormatter = (item: SearchBoxItem): string => item.name

interface Props<T extends SearchBoxItem> {
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
  setFilter,
  select,
  title
}: Props<T>): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const dispatch = useDispatch()
  const activeSearch: string = useSelector(selectActiveSearch)
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
  const isActive = activeSearch === id
  return (
    <div className='SearchBox'>
      <input
        placeholder={title}
        type='text'
        value={currentFilter}
        ref={inputRef}
        onChange={e => {
          setFilter(e.target.value)
          dispatch(activate(id))
        }}
        onFocus={() => {
          dispatch(activate(id))
        }}
      />
      <button onClick={() => {
        setFilter('')
        inputRef.current?.focus()
      }}>X</button>
      {!isLoading && currentFilter.length > 0 && isActive && (
        <div className='SearchResults'>
          <ul>
            {visibleOptions.map(item => (
              <li
                key={item.id}
                onClick={() => {
                  select(item)
                  setFilter('')
                }}
              >
                {formatter(item)}
              </li>
            ))}
            <div className='SearchInfo'>
              {!areAllShown &&
                <>
                  <hr/>
                  <div>
                    There are more results. Refine search...
                  </div>
                </>
              }
              {visibleOptions.length === 0 && <div>No results</div>}
              <LoadingIndicator isLoading={isLoading} />
            </div>
          </ul>
        </div>
      )}
    </div>
  )
}

export default SearchBox
