import { useState } from 'react'

import { useListStylesQuery } from '../store/style/api'
import { type Style } from '../store/style/types'

import SearchBox, { type SearchBoxItem } from './SearchBox'

export interface Props {
  select: (style: Style) => void
}

function SearchStyle (props: Props): JSX.Element {
  const { data: styleData, isLoading } = useListStylesQuery()
  const [filter, setFilter] = useState('')

  const filterParts = filter.trim().toLowerCase().split(' ')
  const filteredStyles = styleData?.styles.filter(style => {
    const name = style.name.toLowerCase()
    for (const part of filterParts) {
      if (!name.includes(part)) return false
    }
    return true
  }) ?? []

  return (
    <div>
      <SearchBox
        currentFilter={filter}
        currentOptions={filteredStyles}
        isLoading={isLoading}
        setFilter={(filter: string) => { setFilter(filter) }}
        select={(style: SearchBoxItem) => {
          props.select(style as Style)
        }}
        title={'Search style'}
      />
    </div>
  )
}

export default SearchStyle
