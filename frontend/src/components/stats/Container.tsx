import React, { useState } from 'react'

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

interface Props {
  getContainerStatsIf: GetContainerStatsIf
  breweryId: string | undefined
  styleId: string | undefined
}

function num (str: string): number {
  return parseFloat(str)
}

type SortingOrder = 'text' | 'count' | 'average'

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
  const { stats, isLoading } = props.getContainerStatsIf.useStats({
    breweryId: props.breweryId,
    styleId: props.styleId
  })

  const [
    sortingOrder,
    setSortingOrder
  ] = useState<SortingOrder>('text')
  const [
    sortingDirection,
    setSortingDirection
  ] = useState<ListDirection>('asc')

  function isSelected (property: SortingOrder): boolean {
    return sortingOrder === property
  }

  function createClickHandler (property: SortingOrder): () => void {
    return () => {
      if (isSelected(property)) {
        setSortingDirection(invertDirection(sortingDirection))
        return
      }
      setSortingOrder(property)
      setSortingDirection(property === 'text' ? 'asc' : 'desc')
    }
  }

  const [minReviewCount, setMinReviewCount] = useState(1)
  const [maxReviewCount, setMaxReviewCount] = useState(Infinity)
  const [minReviewAverage, setMinReviewAverage] = useState(4)
  const [maxReviewAverage, setMaxReviewAverage] = useState(10)

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
