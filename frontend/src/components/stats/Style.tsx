import React from 'react'

import { formatTitle, invertDirection } from '../list-helpers'
import type {
  GetStyleStatsIf,
  StyleStatsSortingOrder
} from '../../core/stats/types'
import LoadingIndicator from '../common/LoadingIndicator'
import TabButton from '../common/TabButton'
import StyleLink from '../style/StyleLink'

import Filters from './Filters'

import './StatsTable.css'
import type { SearchParameters } from '../util'
import {
  averageStr,
  countStr,
  listDirectionOrDefault,
  filterNumOrDefault,
  filtersOpenOrDefault,
  filtersOpenStr
} from './filter-util'

interface Props {
  getStyleStatsIf: GetStyleStatsIf
  breweryId: string | undefined
  search: SearchParameters
  setState: (state: Record<string, string>) => void
  styleId: string | undefined
}

function defaultSortingOrder (
  search: SearchParameters
): StyleStatsSortingOrder {
  const value = search.get('sorting_order')
  return value === 'style_name' || value === 'count' || value === 'average'
    ? value : 'style_name'
}

function Style (props: Props): React.JSX.Element {
  const { search } = props
  const sortingOrder = defaultSortingOrder(search)
  const sortingDirection = listDirectionOrDefault(search)
  const minReviewCount = filterNumOrDefault('min_review_count', search)
  const maxReviewCount = filterNumOrDefault('max_review_count', search)
  const minReviewAverage = filterNumOrDefault('min_review_average', search)
  const maxReviewAverage = filterNumOrDefault('max_review_average', search)
  const isFiltersOpen = filtersOpenOrDefault(search)
  const { stats, isLoading } = props.getStyleStatsIf.useStats({
    breweryId: props.breweryId,
    styleId: props.styleId,
    sorting: {
      order: sortingOrder,
      direction: sortingDirection
    },
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage
  })

  function getCurrentState(): Record<string, string> {
    const currentState: Record<string, string> = {
      min_review_count: countStr(minReviewCount),
      max_review_count: countStr(maxReviewCount),
      min_review_average: averageStr(minReviewAverage),
      max_review_average: averageStr(maxReviewAverage),
      sorting_order: sortingOrder,
      list_direction: sortingDirection,
      filters_open: filtersOpenStr(isFiltersOpen)
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

  function setIsFiltersOpen (isOpen: boolean): void {
    const newState: Record<string, string> = getCurrentState()
    newState.filters_open = filtersOpenStr(isOpen)
    props.setState(newState)
  }

  function isSelected (property: StyleStatsSortingOrder): boolean {
    return sortingOrder === property
  }

  function createClickHandler (property: StyleStatsSortingOrder): () => void {
    return () => {
      if (isSelected(property)) {
        props.setState({
          ...getCurrentState(),
          list_direction: invertDirection(sortingDirection)
        })
        return
      }
      const direction = property === 'style_name' ? 'asc' : 'desc'
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
                isSelected={isSelected('style_name')}
                title={formatTitle(
                  'Style',
                  isSelected('style_name'),
                  sortingDirection
                )}
                onClick={createClickHandler('style_name')} />
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
                isOpen={isFiltersOpen}
                setIsOpen={setIsFiltersOpen}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {stats?.style.map(style => (
            <tr key={style.styleId}>
              <td className='StatsNameColumn'>
                <StyleLink style={{
                  id: style.styleId,
                  name: style.styleName
                }} />
              </td>
              <td className='StatsNumColumn'>{style.reviewCount}</td>
              <td className='StatsNumColumn'>{style.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Style
