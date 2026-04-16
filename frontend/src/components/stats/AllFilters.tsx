import React from 'react'

import type { StatsFilters } from '../../core/stats/types'

import './Filters.css'
import Filters from './Filters'

interface Props {
  filters: StatsFilters
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

function AllFilters(props: Props): React.JSX.Element {
  return (
    <Filters
      filters={props.filters}
      timeStart={props.filters.timeStart}
      timeEnd={props.filters.timeEnd}
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
    />
  )
}

export default AllFilters
