import React from 'react'

import { formatTitle } from '../list-helpers'

import type {
  BreweryStatsSortingOrder,
  OneBreweryStats,
  StatsFilters,
} from '../../core/stats/types'

import type { ListDirection } from '../../core/types'

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

function formatCount(brewery: OneBreweryStats): string {
  if (brewery.reviewCount === brewery.reviewedBeerCount) {
    return brewery.reviewCount
  }
  return `${brewery.reviewCount} (${brewery.reviewedBeerCount})`
}

function BreweryStatsTable(props: Props): React.JSX.Element {
  const filters = props.filters

  function isSelected(property: BreweryStatsSortingOrder): boolean {
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
                isUpperCase={true}
                title={formatTitle(
                  'Brewery',
                  isSelected('brewery_name'),
                  props.sortingDirection,
                )}
                onClick={() => {
                  props.setSortingOrder('brewery_name')
                }}
              />
            </th>
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('count')}
                isUpperCase={false}
                title={formatTitle(
                  'n',
                  isSelected('count'),
                  props.sortingDirection,
                )}
                onClick={() => {
                  props.setSortingOrder('count')
                }}
              />
            </th>
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('average')}
                isUpperCase={true}
                title={formatTitle(
                  'Avg',
                  isSelected('average'),
                  props.sortingDirection,
                )}
                onClick={() => {
                  props.setSortingOrder('average')
                }}
              />
            </th>
            <th className='StatsNumColumn'>Med</th>
            <th className='StatsNumColumn'>Mod</th>
            <th className='StatsNumColumn'>σ</th>
          </tr>
          <tr>
            <th colSpan={6}>
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
            columnCount={6}
          />
          {props.breweries.map((brewery) => (
            <tr key={brewery.breweryId}>
              <td className='StatsNameColumn'>
                <BreweryLinks
                  breweries={[
                    {
                      id: brewery.breweryId,
                      name: brewery.breweryName,
                    },
                  ]}
                />
              </td>
              <td className='StatsNumColumn'>{formatCount(brewery)}</td>
              <td className='StatsNumColumn'>{brewery.reviewAverage}</td>
              <td className='StatsNumColumn'>{brewery.reviewMedian}</td>
              <td className='StatsNumColumn'>{brewery.reviewMode}</td>
              <td className='StatsNumColumn'>
                {brewery.reviewStandardDeviation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BreweryStatsTable
