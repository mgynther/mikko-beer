import React from 'react'

import { formatTitle } from '../list-helpers'

import type {
  LocationStatsSortingOrder,
  OneLocationStats,
  StatsFilters
} from '../../core/stats/types'

import type {
  ListDirection
} from '../../core/types'

import LoadingIndicator from '../common/LoadingIndicator'
import TabButton from '../common/TabButton'
import LocationLink from '../location/LocationLink'

import Filters from './Filters'

import './StatsTable.css'

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

function LocationStatsTable (props: Props): React.JSX.Element {
  const filters = props.filters

  function isSelected (property: LocationStatsSortingOrder): boolean {
    return props.sortingOrder === property
  }

  return (
    <div>
      <LoadingIndicator isLoading={props.isLoading} />
      <table className='StatsTable SortableStats'>
        <thead>
          <tr>
            <th className='StatsNameColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('location_name')}
                title={formatTitle(
                  'Location',
                  isSelected('location_name'),
                  props.sortingDirection
                )}
                onClick={() => { props.setSortingOrder('location_name'); }} />
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
              <Filters
                filters={filters}
                isOpen={props.isFiltersOpen}
                setIsOpen={props.setIsFiltersOpen}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {props.locations.map(location => (
            <tr key={location.locationId}>
              <td className='StatsNameColumn'>
                <LocationLink location={{
                  id: location.locationId,
                  name: location.locationName
                }} />
              </td>
              <td className='StatsNumColumn'>{location.reviewCount}</td>
              <td className='StatsNumColumn'>{location.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LocationStatsTable
