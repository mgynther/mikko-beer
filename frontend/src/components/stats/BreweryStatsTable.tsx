import { formatTitle } from '../list-helpers'

import type {
  BreweryStatsSortingOrder,
  OneBreweryStats
} from '../../core/stats/types'

import type {
  ListDirection
} from '../../core/types'

import BreweryLinks from '../brewery/BreweryLinks'
import LoadingIndicator from '../common/LoadingIndicator'
import TabButton from '../common/TabButton'

import Filters from './Filters'

interface Filter {
  value: number
  setValue: (value: number) => void
}

interface FiltersIf {
  minReviewCount: Filter
  maxReviewCount: Filter
  minReviewAverage: Filter
  maxReviewAverage: Filter
}

interface Props {
  breweries: OneBreweryStats[]
  filters: FiltersIf
  isLoading: boolean
  sortingDirection: ListDirection
  sortingOrder: BreweryStatsSortingOrder
  setSortingOrder: (order: BreweryStatsSortingOrder) => void
}

function BreweryStatsTable (props: Props): JSX.Element {
  const filters = props.filters

  function isSelected (property: BreweryStatsSortingOrder): boolean {
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
                isSelected={isSelected('brewery_name')}
                title={formatTitle(
                  'Brewery',
                  isSelected('brewery_name'),
                  props.sortingDirection
                )}
                onClick={() => props.setSortingOrder('brewery_name')} />
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
                onClick={() => props.setSortingOrder('count')} />
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
                onClick={() => props.setSortingOrder('average')} />
            </th>
          </tr>
          <tr>
            <th colSpan={3}>
              <Filters
                minReviewCount={filters.minReviewCount.value}
                setMinReviewCount={filters.minReviewCount.setValue}
                maxReviewCount={filters.maxReviewCount.value}
                setMaxReviewCount={filters.maxReviewCount.setValue}
                minReviewAverage={filters.minReviewAverage.value}
                setMinReviewAverage={filters.minReviewAverage.setValue}
                maxReviewAverage={filters.maxReviewAverage.value}
                setMaxReviewAverage={filters.maxReviewAverage.setValue}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {props.breweries.map(brewery => (
            <tr key={brewery.breweryId}>
              <td className='StatsNameColumn'>
                <BreweryLinks breweries={[{
                  id: brewery.breweryId,
                  name: brewery.breweryName
                }]} />
              </td>
              <td className='StatsNumColumn'>{brewery.reviewCount}</td>
              <td className='StatsNumColumn'>{brewery.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BreweryStatsTable