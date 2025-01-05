import React from 'react'

import type {
  GetContainerStatsIf,
  OneContainerStats
} from '../../core/stats/types'

import LoadingIndicator from '../common/LoadingIndicator'

import './StatsTable.css'
import { asText } from '../container/ContainerInfo'
import Filters from './Filters'
import TabButton from '../common/TabButton'
import type { ListDirection } from '../../core/types'
import { formatTitle, invertDirection } from '../list-helpers'
import type { SearchParameters } from '../util'
import {
  averageStr,
  countStr,
  listDirectionOrDefault,
  filterNumOrDefault
} from './filter-util'

interface Props {
  getContainerStatsIf: GetContainerStatsIf
  breweryId: string | undefined
  search: SearchParameters
  setState: (state: Record<string, string>) => void
  styleId: string | undefined
}

function num (str: string): number {
  return parseFloat(str)
}

type SortingOrder = 'text' | 'count' | 'average'

function defaultSortingOrder (search: SearchParameters): SortingOrder {
  const value = search.get('sorting_order')
  return value === 'text' || value === 'count' || value === 'average'
    ? value : 'text'
}

interface NumContainer {
  id: string
  text: string
  count: number
  average: number
}

interface VisualContainer {
  id: string
  text: string
  count: string
  average: string
}

function toNum (container: OneContainerStats): NumContainer {
  return {
    id: container.containerId,
    text: asText({
      id: container.containerId,
      size: container.containerSize,
      type: container.containerType
    }),
    count: num(container.reviewCount),
    average: num(container.reviewAverage)
  }
}

function toVisual (container: NumContainer): VisualContainer {
  return {
    id: container.id,
    text: container.text,
    count: container.count.toFixed(0),
    average: container.average.toFixed(2)
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

function getSorter (order: SortingOrder, direction: ListDirection): Sorter {
  switch (order) {
  case 'text':
    return direction === 'asc' ? textAscSorter : textDescSorter
  case 'average':
    return direction === 'asc' ? averageAscSorter : averageDescSorter
  case 'count':
    return direction === 'asc' ? countAscSorter : countDescSorter
  }
}

function Container (props: Props): React.JSX.Element {
  const sortingOrder = defaultSortingOrder(props.search)
  const sortingDirection = listDirectionOrDefault(props.search)
  const minReviewCount = filterNumOrDefault('min_review_count', props.search)
  const maxReviewCount = filterNumOrDefault('max_review_count', props.search)
  const minReviewAverage =
    filterNumOrDefault('min_review_average', props.search)
  const maxReviewAverage =
    filterNumOrDefault('max_review_average', props.search)

  const { stats, isLoading } = props.getContainerStatsIf.useStats({
    breweryId: props.breweryId,
    styleId: props.styleId
  })

  function getCurrentState(): Record<string, string> {
    const currentState: Record<string, string> = {
      min_review_count: countStr(minReviewCount),
      max_review_count: countStr(maxReviewCount),
      min_review_average: averageStr(minReviewAverage),
      max_review_average: averageStr(maxReviewAverage),
      sorting_order: sortingOrder,
      list_direction: sortingDirection,
    }
    return currentState
  }

  function getFilterSetter(
    key: string,
    converter: (value: number) => string
  ) {
    return (value: number) => {
      const newState: Record<string, string> = getCurrentState()
      newState[key] = converter(value)
      props.setState(newState)
    }
  }

  const setMinReviewCount = getFilterSetter('min_review_count', countStr)
  const setMaxReviewCount = getFilterSetter('max_review_count', countStr)
  const setMinReviewAverage = getFilterSetter('min_review_average', averageStr)
  const setMaxReviewAverage = getFilterSetter('max_review_average', averageStr)

  function isSelected (property: SortingOrder): boolean {
    return sortingOrder === property
  }

  function createClickHandler (property: SortingOrder): () => void {
    return () => {
      if (isSelected(property)) {
        props.setState({
          ...getCurrentState(),
          list_direction: invertDirection(sortingDirection)
        })
        return
      }
      const direction = property === 'text' ? 'asc' : 'desc'
      props.setState({
        ...getCurrentState(),
        sorting_order: property,
        list_direction: direction
      })
    }
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
                title={formatTitle(
                  'Container',
                  isSelected('text'),
                  sortingDirection
                )}
                onClick={createClickHandler('text')} />
            </th>
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('count')}
                title={formatTitle(
                  'Reviews',
                  isSelected('count'),
                  sortingDirection
                )}
                onClick={createClickHandler('count')} />
            </th>
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('average')}
                title={formatTitle(
                  'Average',
                  isSelected('average'),
                  sortingDirection
                )}
                onClick={createClickHandler('average')} />
            </th>
          </tr>
          <tr>
            <th colSpan={3}>
              <Filters
                filters={{
                  minReviewCount: {
                    value: minReviewCount,
                    setValue: setMinReviewCount
                  },
                  maxReviewCount: {
                    value: maxReviewCount,
                    setValue: setMaxReviewCount
                  },
                  minReviewAverage: {
                    value: minReviewAverage,
                    setValue: setMinReviewAverage
                  },
                  maxReviewAverage: {
                    value: maxReviewAverage,
                    setValue: setMaxReviewAverage
                  }
                }}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {stats?.container.map(toNum)
            .filter(
              container =>
                container.average >= minReviewAverage
                && container.average <= maxReviewAverage
                && container.count >= minReviewCount
                && container.count <= maxReviewCount
            ).sort(
              getSorter(sortingOrder, sortingDirection)
            ).map(
              toVisual
            ).map(container => (
              <tr key={container.id}>
                <td>{container.text}</td>
                <td>{container.count}</td>
                <td>{container.average}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default Container
