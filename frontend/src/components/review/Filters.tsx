import React, { useState } from 'react'

import StepFilterSlider from '../common/StepFilterSlider'

import TimeFilterSlider from '../common/TimeFilterSlider'
import type { ReviewFilter, ReviewFilters } from './filter-types'
import OpenFiltersButton from '../common/OpenFiltersButton'
import FilterControls from '../common/FilterControls'
import type { YearMonth, YearMonthFilter } from '../../core/types'

interface Props {
  filters: ReviewFilters
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

function Filters(props: Props): React.JSX.Element {
  const { isOpen } = props
  const { minRating, maxRating, minTime, maxTime } = props.filters
  function wrapStatsFilter(
    reviewFilter: ReviewFilter,
  ): [number, (value: number) => void] {
    const [valueRt, setValueRt] = useState(reviewFilter.value)
    const setValue = (count: number): void => {
      setValueRt(count)
      reviewFilter.setValue(count)
    }
    return [valueRt, setValue]
  }
  const [minRatingValue, setMinRatingValue] = wrapStatsFilter(minRating)
  const [minRatingDisplayValue, setMinRatingDisplayValue] = useState(
    minRating.value,
  )
  const [maxRatingValue, setMaxRatingValue] = wrapStatsFilter(maxRating)
  const [maxRatingDisplayValue, setMaxRatingDisplayValue] = useState(
    maxRating.value,
  )

  function wrapYearMonthFilter(
    filter: YearMonthFilter,
  ): [YearMonth, (value: YearMonth) => void] {
    const [valueRt, setValueRt] = useState(filter.value)
    const setValue = (value: YearMonth): void => {
      setValueRt(value)
      filter.setValue(value)
    }
    return [valueRt, setValue]
  }
  const [minTimeValue, setMinTimeValue] = wrapYearMonthFilter(minTime)
  const [maxTimeValue, setMaxTimeValue] = wrapYearMonthFilter(maxTime)
  return (
    <div>
      <OpenFiltersButton isOpen={isOpen} setIsOpen={props.setIsOpen} />
      {isOpen && (
        <FilterControls>
          <StepFilterSlider
            title={`Minimum rating: ${minRatingDisplayValue}`}
            min={4}
            max={10}
            step={1}
            value={minRatingValue}
            setDisplayValue={setMinRatingDisplayValue}
            setValue={setMinRatingValue}
          />
          <StepFilterSlider
            title={`Maximum rating: ${maxRatingDisplayValue}`}
            min={4}
            max={10}
            step={1}
            value={maxRatingValue}
            setDisplayValue={setMaxRatingDisplayValue}
            setValue={setMaxRatingValue}
          />
          <TimeFilterSlider
            title={'Minimum time'}
            minTime={minTime.min}
            maxTime={minTime.max}
            setTime={setMinTimeValue}
            time={minTimeValue}
          />
          <TimeFilterSlider
            title={'Maximum time'}
            minTime={maxTime.min}
            maxTime={maxTime.max}
            setTime={setMaxTimeValue}
            time={maxTimeValue}
          />
        </FilterControls>
      )}
    </div>
  )
}

export default Filters
