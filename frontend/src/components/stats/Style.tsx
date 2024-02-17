import { useState } from 'react'

import { useGetStyleStatsQuery } from '../../store/stats/api'

import { formatTitle, invertDirection } from '../list-helpers'
import { type StyleStatsSortingOrder } from '../../store/stats/types'
import { type ListDirection } from '../../store/types'
import LoadingIndicator from '../common/LoadingIndicator'
import TabButton from '../common/TabButton'

import Filters from './Filters'

import './Stats.css'

interface Props {
  breweryId: string | undefined
}

function Style (props: Props): JSX.Element {
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
  const { data: styleData, isLoading } = useGetStyleStatsQuery({
    breweryId: props.breweryId,
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

  const style = styleData?.style
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
                minReviewCount={minReviewCount}
                setMinReviewCount={setMinReviewCount}
                maxReviewCount={maxReviewCount}
                setMaxReviewCount={setMaxReviewCount}
                minReviewAverage={minReviewAverage}
                setMinReviewAverage={setMinReviewAverage}
                maxReviewAverage={maxReviewAverage}
                setMaxReviewAverage={setMaxReviewAverage}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {style?.map(style => (
            <tr key={style.styleId}>
              <td className='StatsNameColumn'>{style.styleName}</td>
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
