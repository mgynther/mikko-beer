import React from 'react'

import type {
  GetContainerStatsIf,
  OneContainerStats,
} from '../../core/stats/types'

import LoadingIndicator from '../common/LoadingIndicator'

import './StatsTable.css'
import { asText } from '../container/ContainerInfo'
import Filters from './Filters'
import TabButton from '../common/TabButton'
import type { ListDirection, UseDebounce } from '../../core/types'
import { formatTitle } from '../list-helpers'
import type { SearchParameters } from '../util'
import { searchParams } from './search-params'
import type { SearchRecord } from './filter-util'

interface Props {
  getContainerStatsIf: GetContainerStatsIf
  breweryId: string | undefined
  locationId: string | undefined
  search: SearchParameters
  setState: (state: Record<string, string>) => void
  styleId: string | undefined
}

function num(str: string): number {
  return parseFloat(str)
}

function toFixed(number: number): string {
  return number.toFixed(2)
}

type SortingOrder = 'text' | 'count' | 'average' | 'std_dev'

function sortingOrderOrDefault(
  search: SearchParameters | undefined,
): SortingOrder {
  const value = search?.get('s_order')
  if (value === 'text') {
    return value
  }
  if (value === 'count') {
    return value
  }
  if (value === 'average') {
    return value
  }
  if (value === 'std_dev') {
    return value
  }
  return 'text'
}

interface NumContainer {
  id: string
  text: string
  count: number
  average: number
  median: string
  mode: string
  standardDeviation: number
}

interface VisualContainer {
  id: string
  text: string
  count: string
  average: string
  median: string
  mode: string
  standardDeviation: string
}

function toNum(container: OneContainerStats): NumContainer {
  return {
    id: container.containerId,
    text: asText({
      id: container.containerId,
      size: container.containerSize,
      type: container.containerType,
    }),
    count: num(container.reviewCount),
    average: num(container.reviewAverage),
    median: container.reviewMedian,
    mode: container.reviewMode,
    standardDeviation: num(container.reviewStandardDeviation),
  }
}

function toVisual(container: NumContainer): VisualContainer {
  return {
    id: container.id,
    text: container.text,
    count: container.count.toFixed(0),
    average: toFixed(container.average),
    median: container.median,
    mode: container.mode,
    standardDeviation: toFixed(container.standardDeviation),
  }
}

type Sorter = (a: NumContainer, b: NumContainer) => number

const textAscSorter: Sorter = (a: NumContainer, b: NumContainer) =>
  a.text.localeCompare(b.text)
const textDescSorter: Sorter = (a: NumContainer, b: NumContainer) =>
  b.text.localeCompare(a.text)
const averageAscSorter: Sorter = (a: NumContainer, b: NumContainer) =>
  a.average - b.average
const averageDescSorter: Sorter = (a: NumContainer, b: NumContainer) =>
  b.average - a.average
const countAscSorter: Sorter = (a: NumContainer, b: NumContainer) =>
  a.count - b.count
const countDescSorter: Sorter = (a: NumContainer, b: NumContainer) =>
  b.count - a.count
const stddevAscSorter: Sorter = (a: NumContainer, b: NumContainer) =>
  a.standardDeviation - b.standardDeviation
const stddevDescSorter: Sorter = (a: NumContainer, b: NumContainer) =>
  b.standardDeviation - a.standardDeviation

function getSorter(order: SortingOrder, direction: ListDirection): Sorter {
  switch (order) {
    case 'text':
      return direction === 'asc' ? textAscSorter : textDescSorter
    case 'average':
      return direction === 'asc' ? averageAscSorter : averageDescSorter
    case 'count':
      return direction === 'asc' ? countAscSorter : countDescSorter
    case 'std_dev':
      return direction === 'asc' ? stddevAscSorter : stddevDescSorter
  }
}

export const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

function Container(props: Props): React.JSX.Element {
  const { search } = props
  const parsedSearchParams = searchParams({
    nameProperty: 'text',
    search,
    minTime: {
      year: 2017,
      month: 12,
    },
    maxTime: {
      year: 9999,
      month: 12,
    },
    getUseDebounce: getUseDebounce,
    sortingOrderParser: sortingOrderOrDefault,
    setState: (state: SearchRecord) => {
      props.setState({
        s_order: state.s_order,
        s_direction: state.s_direction,
        s_min_count: state.s_min_count,
        s_max_count: state.s_max_count,
        s_min_avg: state.s_min_avg,
        s_max_avg: state.s_max_avg,
        s_filters: state.s_filters,
      })
    },
  })

  const { stats, isLoading } = props.getContainerStatsIf.useStats({
    breweryId: props.breweryId,
    locationId: props.locationId,
    styleId: props.styleId,
  })

  function isSelected(property: SortingOrder): boolean {
    return parsedSearchParams.statsParams.sortingOrder === property
  }

  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable SortableStats'>
        <thead>
          <tr>
            <th className='StatsNameColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('text')}
                isUpperCase={true}
                title={formatTitle(
                  'Container',
                  isSelected('text'),
                  parsedSearchParams.statsParams.sortingDirection,
                )}
                onClick={() => parsedSearchParams.changeSortingOrder('text')}
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
                  parsedSearchParams.statsParams.sortingDirection,
                )}
                onClick={() => parsedSearchParams.changeSortingOrder('count')}
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
                  parsedSearchParams.statsParams.sortingDirection,
                )}
                onClick={() => parsedSearchParams.changeSortingOrder('average')}
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
                  parsedSearchParams.statsParams.sortingDirection,
                )}
                onClick={() => parsedSearchParams.changeSortingOrder('std_dev')}
              />
            </th>
          </tr>
          <tr>
            <th colSpan={6}>
              <Filters
                filterState={{
                  isOpen: parsedSearchParams.statsParams.isFiltersOpen,
                  setIsOpen: parsedSearchParams.setIsFiltersOpen,
                  filters: parsedSearchParams.filters,
                }}
                timeStart={undefined}
                timeEnd={undefined}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {stats?.container
            .map(toNum)
            .filter(
              (container) =>
                container.average >=
                  parsedSearchParams.statsParams.minReviewAverage &&
                container.average <=
                  parsedSearchParams.statsParams.maxReviewAverage &&
                container.count >=
                  parsedSearchParams.statsParams.minReviewCount &&
                container.count <=
                  parsedSearchParams.statsParams.maxReviewCount,
            )
            .sort(
              getSorter(
                parsedSearchParams.statsParams.sortingOrder,
                parsedSearchParams.statsParams.sortingDirection,
              ),
            )
            .map(toVisual)
            .map((container) => (
              <tr key={container.id}>
                <td>{container.text}</td>
                <td>{container.count}</td>
                <td>{container.average}</td>
                <td>{container.median}</td>
                <td>{container.mode}</td>
                <td>{container.standardDeviation}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default Container
