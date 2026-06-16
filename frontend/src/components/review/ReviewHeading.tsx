import React from 'react'

import type { ReviewSorting, ReviewSortingOrder } from '../../core/review/types'

import { formatTitle } from '../list-helpers'
import TabButton from '../common/TabButton'

import './Review.css'
import './ReviewHeading.css'
import Filters from './Filters'
import type { ReviewFilterState } from './filter-types'

interface HeadingProps {
  filterState: ReviewFilterState
  sorting: ReviewSorting | undefined
  setSorting: (sorting: ReviewSortingOrder) => void
  supportedSorting: ReviewSortingOrder[]
}

export function ReviewHeading(props: HeadingProps): React.JSX.Element {
  function isSelected(property: ReviewSortingOrder): boolean {
    return props.sorting?.order === property
  }
  const direction = props.sorting?.direction
  const breweryNameTitle = formatTitle(
    'Breweries',
    isSelected('brewery_name'),
    direction,
  )
  const nameTitle = formatTitle('Name', isSelected('beer_name'), direction)
  const ratingTitle = formatTitle('Rating', isSelected('rating'), direction)
  const timeTitle = formatTitle('Time', isSelected('time'), direction)
  function createClickHandler(property: ReviewSortingOrder): () => void {
    return () => props.setSorting(property)
  }
  function isSortingSupported(property: ReviewSortingOrder): boolean {
    return (
      props.sorting !== undefined && props.supportedSorting.includes(property)
    )
  }
  return (
    <>
      <div className='Review-heading'>
        {!isSortingSupported('brewery_name') && <div>Breweries</div>}
        {isSortingSupported('brewery_name') && (
          <TabButton
            title={breweryNameTitle}
            onClick={createClickHandler('brewery_name')}
            isCompact={true}
            isSelected={props.sorting?.order === 'brewery_name'}
            isUpperCase={false}
          />
        )}
        {!isSortingSupported('beer_name') && <div>Name</div>}
        {isSortingSupported('beer_name') && (
          <TabButton
            title={nameTitle}
            onClick={createClickHandler('beer_name')}
            isCompact={true}
            isSelected={props.sorting?.order === 'beer_name'}
            isUpperCase={false}
          />
        )}
        <div>Styles</div>
        {!isSortingSupported('rating') && (
          <div className='Review-rating-heading'>Rating</div>
        )}
        {isSortingSupported('rating') && (
          <div className='Review-rating-heading'>
            <TabButton
              title={ratingTitle}
              onClick={createClickHandler('rating')}
              isCompact={true}
              isSelected={props.sorting?.order === 'rating'}
              isUpperCase={false}
            />
          </div>
        )}
        {!isSortingSupported('time') && (
          <div className='Review-time-heading'>Time</div>
        )}
        {isSortingSupported('time') && (
          <div className='Review-time-heading'>
            <TabButton
              title={timeTitle}
              onClick={createClickHandler('time')}
              isCompact={true}
              isSelected={props.sorting?.order === 'time'}
              isUpperCase={false}
            />
          </div>
        )}
      </div>
      <Filters filterState={props.filterState} />
    </>
  )
}

export default ReviewHeading
