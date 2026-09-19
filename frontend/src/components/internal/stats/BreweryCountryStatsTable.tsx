import React from 'react'

import { formatTitle } from '../list-helpers'

import type {
  BreweryCountryStatsSortingOrder,
  OneBreweryCountryStats,
} from '../../types/stats/types'

import type { ListDirection } from '../../types/types'

import Flag from '../common/Flag'
import TableSkeleton from '../common/TableSkeleton'
import TabButton from '../common/TabButton'

import AllFilters from './AllFilters'

import './StatsTable.css'
import type { StatsFilterState } from './filter-types'

const columnCount = 7

interface Props {
  breweryCountries: OneBreweryCountryStats[]
  filterState: StatsFilterState
  isLoading: boolean
  sortingDirection: ListDirection
  sortingOrder: BreweryCountryStatsSortingOrder
  setSortingOrder: (order: BreweryCountryStatsSortingOrder) => void
}

function formatCount(breweryCountry: OneBreweryCountryStats): string {
  if (breweryCountry.reviewCount === breweryCountry.reviewedBeerCount) {
    return breweryCountry.reviewCount
  }
  return `${breweryCountry.reviewCount} (${breweryCountry.reviewedBeerCount})`
}

function BreweryCountryStatsTable(props: Props): React.JSX.Element {
  function isSelected(property: BreweryCountryStatsSortingOrder): boolean {
    return props.sortingOrder === property
  }

  return (
    <div>
      <table className='StatsTable SortableStats'>
        <thead>
          <tr>
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('country_code')}
                isUpperCase={true}
                title={formatTitle(
                  'Country',
                  isSelected('country_code'),
                  props.sortingDirection,
                )}
                onClick={() => {
                  props.setSortingOrder('country_code')
                }}
              />
            </th>
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('count')}
                isUpperCase={false}
                title={formatTitle(
                  'Rvw n',
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
                isSelected={isSelected('brewery_count')}
                isUpperCase={false}
                title={formatTitle(
                  'Brwr n',
                  isSelected('brewery_count'),
                  props.sortingDirection,
                )}
                onClick={() => {
                  props.setSortingOrder('brewery_count')
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
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('std_dev')}
                isUpperCase={false}
                title={formatTitle(
                  'σ',
                  isSelected('std_dev'),
                  props.sortingDirection,
                )}
                onClick={() => {
                  props.setSortingOrder('std_dev')
                }}
              />
            </th>
          </tr>
          <tr>
            <th colSpan={columnCount}>
              <AllFilters filterState={props.filterState} />
            </th>
          </tr>
        </thead>
        <tbody>
          <TableSkeleton
            isLoading={props.isLoading}
            rowCount={3}
            columnCount={columnCount}
          />
          {props.breweryCountries.map((breweryCountry) => (
            <tr key={breweryCountry.countryCode}>
              <td className='StatsNumColumn'>
                {breweryCountry.countryCode}{' '}
                <Flag country={breweryCountry.countryCode} />
              </td>
              <td className='StatsNumColumn'>{formatCount(breweryCountry)}</td>
              <td className='StatsNumColumn'>{breweryCountry.breweryCount}</td>
              <td className='StatsNumColumn'>{breweryCountry.reviewAverage}</td>
              <td className='StatsNumColumn'>{breweryCountry.reviewMedian}</td>
              <td className='StatsNumColumn'>{breweryCountry.reviewMode}</td>
              <td className='StatsNumColumn'>
                {breweryCountry.reviewStandardDeviation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BreweryCountryStatsTable
