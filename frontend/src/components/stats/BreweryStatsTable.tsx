import React from 'react'

import { formatTitle } from '../list-helpers'

import type {
  BreweryStatsSortingOrder,
  OneBreweryStats,
  StatsFilters
} from '../../core/stats/types'

import type {
  ListDirection
} from '../../core/types'

import BreweryLinks from '../brewery/BreweryLinks'
import TableSkeleton from '../common/TableSkeleton'
import TabButton from '../common/TabButton'

import AllFilters from './AllFilters'

import './StatsTable.css'

interface Props {
  breweries: OneBreweryStats[]
  filters: StatsFilters
  isFiltersOpen: boolean
  setIsFiltersOpen: (isOpen: boolean) => void
  isLoading: boolean
  sortingDirection: ListDirection
  sortingOrder: BreweryStatsSortingOrder
  setSortingOrder: (order: BreweryStatsSortingOrder) => void
}

function formatCount (brewery: OneBreweryStats): string {
  if (brewery.reviewCount === brewery.reviewedBeerCount) {
    return brewery.reviewCount
  }
  return `${brewery.reviewCount} (${brewery.reviewedBeerCount})`
}

function BreweryStatsTable (props: Props): React.JSX.Element {
  const filters = props.filters

  function isSelected (property: BreweryStatsSortingOrder): boolean {
    return props.sortingOrder === property
  }

  return (
    <div>
      <table className='StatsTable SortableStats'>
        <thead>
          <tr>
            <th className='StatsNameColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('brewery_name')}
                title={formatTitle(
                  'Brewery',
                  isSelected('brewery_name'),
                  props.sortingDirection
                )}
                onClick={() => { props.setSortingOrder('brewery_name'); }} />
            </th>
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('count')}
                title={formatTitle(
                  'Reviews',
                  isSelected('count'),
                  props.sortingDirection
                )}
                onClick={() => { props.setSortingOrder('count'); }} />
            </th>
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('average')}
                title={formatTitle(
                  'Average',
                  isSelected('average'),
                  props.sortingDirection
                )}
                onClick={() => { props.setSortingOrder('average'); }} />
            </th>
          </tr>
          <tr>
            <th colSpan={3}>
              <AllFilters
                filters={filters}
                isOpen={props.isFiltersOpen}
                setIsOpen={props.setIsFiltersOpen}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <TableSkeleton
            isLoading={props.isLoading}
            rowCount={3}
            columnCount={3}
          />
          {props.breweries.map(brewery => (
            <tr key={brewery.breweryId}>
              <td className='StatsNameColumn'>
                <BreweryLinks breweries={[{
                  id: brewery.breweryId,
                  name: brewery.breweryName
                }]} />
              </td>
              <td className='StatsNumColumn'>{formatCount(brewery)}</td>
              <td className='StatsNumColumn'>{brewery.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BreweryStatsTable
