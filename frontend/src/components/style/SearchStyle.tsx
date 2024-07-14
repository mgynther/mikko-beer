import { useState } from 'react'

import type {
  ListStylesIf,
  Style
} from '../../core/style/types'

import SearchBox, { nameFormatter } from '../common/SearchBox'

export interface Props {
  listStylesIf: ListStylesIf
  select: (style: Style) => void
}

function SearchStyle (props: Props): JSX.Element {
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
        formatter={nameFormatter}
        isLoading={isLoading}
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
