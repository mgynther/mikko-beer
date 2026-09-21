import React, { useId, useRef, useState } from 'react'

import Button from './Button'
import LoadingIndicator from './LoadingIndicator'

import './SearchBox.css'
import type { SearchFieldIf } from '../../types/search/types'

export interface SearchBoxItem {
  id: string
  name: string
}

export const nameFormatter = (item: SearchBoxItem): string => item.name

export interface Props<T extends SearchBoxItem> {
  searchFieldIf: SearchFieldIf
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

// The index of the option the arrow keys have moved to, or noHighlight when
// they have not moved to one. aria-activedescendant is then left out, which
// is how a combobox says the keyboard is in the text rather than in the list.
const noHighlight = -1

const SearchBox = <T extends SearchBoxItem>({
  currentFilter,
  currentOptions,
  customSort,
  formatter,
  isLoading,
  searchFieldIf,
  setFilter,
  select,
  title,
}: Props<T>): React.JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const [highlightedIndex, setHighlightedIndex] = useState(noHighlight)
  const { activate, isActive } = searchFieldIf.useSearchField()
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
  const visibleOptions =
    currentFilter.length === 0 ? [] : sortedOptions.slice(0, maxResultCount)
  const areAllShown = visibleOptions.length === sortedOptions.length
  const hasMoreResults = !isLoading && !areAllShown
  const hasNoResults = !isLoading && visibleOptions.length === 0
  const isExpanded = currentFilter.length > 0 && isActive
  // The results arrive while the arrow keys are being used, so an index that
  // was valid when it was set may not be one by the time it is rendered.
  // Deriving the highlight rather than trusting the state keeps it inside the
  // list that is actually on the screen.
  const highlighted =
    highlightedIndex < visibleOptions.length ? highlightedIndex : noHighlight
  const optionId = (index: number): string => `${listboxId}-option-${index}`

  function selectOption(item: T): void {
    select(item)
    setFilter('')
    setHighlightedIndex(noHighlight)
  }

  function highlightNext(): void {
    if (visibleOptions.length === 0) return
    const last = visibleOptions.length - 1
    setHighlightedIndex(highlighted === last ? 0 : highlighted + 1)
  }

  function highlightPrevious(): void {
    if (visibleOptions.length === 0) return
    const last = visibleOptions.length - 1
    setHighlightedIndex(highlighted <= 0 ? last : highlighted - 1)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'ArrowDown') {
      // The caret would otherwise move to the end of the text.
      event.preventDefault()
      activate()
      highlightNext()
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      activate()
      highlightPrevious()
      return
    }
    if (event.key === 'Enter' && highlighted !== noHighlight) {
      // Without this the enter would submit the form the search is in.
      event.preventDefault()
      selectOption(visibleOptions[highlighted])
      return
    }
    if (event.key === 'Escape') {
      // Clearing the filter is what closes the list, the same thing the
      // clear button does: which search field is the active one is store
      // state and a component does not get to unset it.
      setFilter('')
      setHighlightedIndex(noHighlight)
    }
  }

  return (
    <div className='SearchBox'>
      <input
        aria-activedescendant={
          highlighted === noHighlight ? undefined : optionId(highlighted)
        }
        aria-autocomplete='list'
        aria-controls={listboxId}
        aria-expanded={isExpanded}
        aria-label={title}
        autoComplete='off'
        placeholder={title}
        role='combobox'
        type='text'
        value={currentFilter}
        ref={inputRef}
        onChange={(e) => {
          setFilter(e.target.value)
          setHighlightedIndex(noHighlight)
          activate()
        }}
        onFocus={() => {
          activate()
        }}
        onKeyDown={onKeyDown}
      />
      <Button
        onClick={() => {
          setFilter('')
          setHighlightedIndex(noHighlight)
          inputRef.current?.focus()
        }}
        text='X'
      />
      {isExpanded && (
        <div className='SearchResults'>
          {/* A listbox owns options and nothing else, so the counts and the
              loading indicator are siblings of the list rather than the last
              items in it. */}
          <ul aria-label={title} id={listboxId} role='listbox'>
            {visibleOptions.map((item, index) => (
              <li
                aria-selected={index === highlighted}
                id={optionId(index)}
                key={item.id}
                role='option'
                onClick={() => {
                  selectOption(item)
                }}
              >
                {formatter(item)}
              </li>
            ))}
          </ul>
          {visibleOptions.length === 0 && (
            <div className='SearchInfo' role='status'>
              {hasNoResults && <div>No results</div>}
              <LoadingIndicator isLoading={isLoading} />
            </div>
          )}
          {visibleOptions.length > 0 && (
            <div
              className={`SearchInfoContainer ${
                hasMoreResults || isLoading ? 'shown' : ''
              }`}
            >
              <hr />
              <div className='SearchInfo' role='status'>
                {hasMoreResults && (
                  <div>There are more results. Refine search...</div>
                )}
                <LoadingIndicator isLoading={isLoading} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox
