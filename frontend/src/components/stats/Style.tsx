import React, { useState } from 'react'

import { formatTitle, invertDirection } from '../list-helpers'
import type {
  GetStyleStatsIf,
  StyleStatsSortingOrder
} from '../../core/stats/types'
import type { ListDirection } from '../../core/types'
import LoadingIndicator from '../common/LoadingIndicator'
import TabButton from '../common/TabButton'
import StyleLink from '../style/StyleLink'

import Filters from './Filters'

import './StatsTable.css'

interface Props {
  getStyleStatsIf: GetStyleStatsIf
  breweryId: string | undefined
  styleId: string | undefined
}

function Style (props: Props): React.JSX.Element {
  const [
    sortingOrder,
    setSortingOrder
  ] = useState<StyleStatsSortingOrder>('style_name')
  const [
    sortingDirection,
    setSortingDirection
  ] = useState<ListDirection>('asc')
  const [minReviewCount, setMinReviewCount] = useState(1)
  const [maxReviewCount, setMaxReviewCount] = useState(Infinity)
  const [minReviewAverage, setMinReviewAverage] = useState(4)
  const [maxReviewAverage, setMaxReviewAverage] = useState(10)
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

  function isSelected (property: StyleStatsSortingOrder): boolean {
    return sortingOrder === property
  }

  function createClickHandler (property: StyleStatsSortingOrder): () => void {
    return () => {
      if (isSelected(property)) {
        setSortingDirection(invertDirection(sortingDirection))
        return
      }
      setSortingOrder(property)
      setSortingDirection(property === 'style_name' ? 'asc' : 'desc')
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
