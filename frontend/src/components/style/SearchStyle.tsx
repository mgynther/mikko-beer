import React, { useState } from 'react'

import type {
  ListStylesIf,
  Style
} from '../../core/style/types'

import SearchBox, { nameFormatter } from '../common/SearchBox'
import type { SearchIf } from '../../core/search/types'

export interface Props {
  listStylesIf: ListStylesIf
  searchIf: SearchIf
  select: (style: Style) => void
}

function SearchStyle (props: Props): React.JSX.Element {
  const { styles, isLoading } = props.listStylesIf.useList()
  const [filter, setFilter] = useState('')

  const filterParts = filter.trim().toLowerCase().split(' ')
  const filteredStyles = styles?.filter(style => {
    const name = style.name.toLowerCase()
    for (const part of filterParts) {
      if (!name.includes(part)) return false
    }
    return true
  }) ?? []

  return (
    <>
      <SearchBox
        currentFilter={filter}
        currentOptions={filteredStyles}
        customSort={undefined}
        formatter={nameFormatter}
        isLoading={isLoading}
        searchIf={props.searchIf}
        setFilter={(filter: string) => { setFilter(filter) }}
        select={(style: Style) => {
          props.select(style)
        }}
        title={'Search style'}
      />
    </>
  )
}

export default SearchStyle
