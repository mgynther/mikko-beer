import React from 'react'

import { formatTitle } from '../list-helpers'

import type {
  LocationStatsSortingOrder,
  OneLocationStats,
  StatsFilters,
} from '../../core/stats/types'

import type { ListDirection } from '../../core/types'

import TabButton from '../common/TabButton'
import LocationLink from '../location/LocationLink'

import AllFilters from './AllFilters'

import './StatsTable.css'
import TableSkeleton from '../common/TableSkeleton'

interface Props {
  locations: OneLocationStats[]
  filters: StatsFilters
  isFiltersOpen: boolean
  setIsFiltersOpen: (isOpen: boolean) => void
  isLoading: boolean
  sortingDirection: ListDirection
  sortingOrder: LocationStatsSortingOrder
  setSortingOrder: (order: LocationStatsSortingOrder) => void
}

function LocationStatsTable(props: Props): React.JSX.Element {
  const filters = props.filters

  function isSelected(property: LocationStatsSortingOrder): boolean {
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
                isSelected={isSelected('location_name')}
                isUpperCase={true}
                title={formatTitle(
                  'Location',
                  isSelected('location_name'),
                  props.sortingDirection,
                )}
                onClick={() => {
                  props.setSortingOrder('location_name')
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
            columnCount={3}
          />
          {props.locations.map((location) => (
            <tr key={location.locationId}>
              <td className='StatsNameColumn'>
                <LocationLink
                  location={{
                    id: location.locationId,
                    name: location.locationName,
                  }}
                />
              </td>
              <td className='StatsNumColumn'>{location.reviewCount}</td>
              <td className='StatsNumColumn'>{location.reviewAverage}</td>
              <td className='StatsNumColumn'>{location.reviewMedian}</td>
              <td className='StatsNumColumn'>{location.reviewMode}</td>
              <td className='StatsNumColumn'>
                {location.reviewStandardDeviation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LocationStatsTable
