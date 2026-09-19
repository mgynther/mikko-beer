import React from 'react'

import Filters from './Filters'
import type { StatsFilterState } from './filter-types'

interface Props {
  filterState: StatsFilterState
}

function AllFilters(props: Props): React.JSX.Element {
  const { filters, isOpen, setIsOpen } = props.filterState
  return (
    <Filters
      filterState={{
        filters: {
          minReviewCount: filters.minReviewCount,
          maxReviewCount: filters.maxReviewCount,
          minReviewAverage: filters.minReviewAverage,
          maxReviewAverage: filters.maxReviewAverage,
        },
        isOpen,
        setIsOpen,
      }}
      timeStart={filters.timeStart}
      timeEnd={filters.timeEnd}
    />
  )
}

export default AllFilters
