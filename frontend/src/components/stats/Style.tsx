import React from 'react'

import { formatTitle } from '../list-helpers'
import type {
  GetStyleStatsIf,
  StyleStatsSortingOrder,
} from '../../core/stats/types'
import TabButton from '../common/TabButton'
import StyleLink from '../style/StyleLink'

import AllFilters from './AllFilters'

import './StatsTable.css'
import { searchParams } from './search-params'
import type { SearchParameters } from '../../core/types'

interface Props {
  getStyleStatsIf: GetStyleStatsIf
  breweryId: string | undefined
  locationId: string | undefined
  search: SearchParameters
  setState: (state: Record<string, string>) => void
  styleId: string | undefined
}

function sortingOrderOrDefault(
  search: SearchParameters | undefined,
): StyleStatsSortingOrder {
  const value = search?.get('s_order')
  return value === 'style_name' ||
    value === 'count' ||
    value === 'average' ||
    value === 'std_dev'
    ? value
    : 'style_name'
}

function Style(props: Props): React.JSX.Element {
  const { search } = props
  const parsedSearchParams = searchParams({
    nameProperty: 'style_name',
    search,
    minTime: props.getStyleStatsIf.minTime,
    maxTime: props.getStyleStatsIf.maxTime,
    getUseDebounce: props.getStyleStatsIf.getUseDebounce,
    sortingOrderParser: sortingOrderOrDefault,
    setState: (state) => props.setState({ ...state }),
  })
  const { stats } = props.getStyleStatsIf.useStats({
    breweryId: props.breweryId,
    locationId: props.locationId,
    styleId: props.styleId,
    sorting: {
      order: parsedSearchParams.statsParams.sortingOrder,
      direction: parsedSearchParams.statsParams.sortingDirection,
    },
    minReviewCount: parsedSearchParams.statsParams.minReviewCount,
    maxReviewCount: parsedSearchParams.statsParams.maxReviewCount,
    minReviewAverage: parsedSearchParams.statsParams.minReviewAverage,
    maxReviewAverage: parsedSearchParams.statsParams.maxReviewAverage,
    timeStart: parsedSearchParams.statsParams.timeStart,
    timeEnd: parsedSearchParams.statsParams.timeEnd,
  })

  function isSelected(property: StyleStatsSortingOrder): boolean {
    return parsedSearchParams.statsParams.sortingOrder === property
  }

  return (
    <div>
      <table className='StatsTable SortableStats'>
        <thead>
          <tr>
            <th className='StatsNameColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('style_name')}
                isUpperCase={true}
                title={formatTitle(
                  'Style',
                  isSelected('style_name'),
                  parsedSearchParams.statsParams.sortingDirection,
                )}
                onClick={() =>
                  parsedSearchParams.changeSortingOrder('style_name')
                }
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
              <AllFilters
                filterState={{
                  filters: parsedSearchParams.filters,
                  isOpen: parsedSearchParams.statsParams.isFiltersOpen,
                  setIsOpen: parsedSearchParams.setIsFiltersOpen,
                }}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {stats?.style.map((style) => (
            <tr key={style.styleId}>
              <td className='StatsNameColumn'>
                <StyleLink
                  style={{
                    id: style.styleId,
                    name: style.styleName,
                  }}
                />
              </td>
              <td className='StatsNumColumn'>{style.reviewCount}</td>
              <td className='StatsNumColumn'>{style.reviewAverage}</td>
              <td className='StatsNumColumn'>{style.reviewMedian}</td>
              <td className='StatsNumColumn'>{style.reviewMode}</td>
              <td className='StatsNumColumn'>
                {style.reviewStandardDeviation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Style
