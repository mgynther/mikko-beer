import React, { useState } from 'react'

import MaximumReviewCount from './MaximumReviewCount'
import MinimumReviewCount from './MinimumReviewCount'
import StepFilterSlider from '../common/StepFilterSlider'

import TimeFilterSlider from '../common/TimeFilterSlider'
import type { StatsFilter, StatsNoTimeFilterState } from './filter-types'
import OpenFiltersButton from '../common/OpenFiltersButton'
import FilterControls from '../common/FilterControls'
import type { YearMonth, YearMonthFilter } from '../../core/types'

interface Props {
  filterState: StatsNoTimeFilterState
  timeStart: YearMonthFilter | undefined
  timeEnd: YearMonthFilter | undefined
}

function Filters(props: Props): React.JSX.Element {
  const { isOpen } = props.filterState
  const { minReviewCount, maxReviewCount, minReviewAverage, maxReviewAverage } =
    props.filterState.filters
  const { timeStart, timeEnd } = props
  function wrapStatsFilter(
    statsFilter: StatsFilter,
  ): [number, (value: number) => void] {
    const [valueRt, setValueRt] = useState(statsFilter.value)
    const setValue = (count: number): void => {
      setValueRt(count)
      statsFilter.setValue(count)
    }
    return [valueRt, setValue]
  }
  const [minReviewCountValue, setMinReviewCount] =
    wrapStatsFilter(minReviewCount)
  const [maxReviewCountValue, setMaxReviewCount] =
    wrapStatsFilter(maxReviewCount)
  const [minReviewAverageValue, setMinReviewAverage] =
    wrapStatsFilter(minReviewAverage)
  const [minReviewAverageDisplayValue, setMinReviewAverageDisplayValue] =
    useState(minReviewAverageValue)
  const [maxReviewAverageValue, setMaxReviewAverage] =
    wrapStatsFilter(maxReviewAverage)
  const [maxReviewAverageDisplayValue, setMaxReviewAverageDisplayValue] =
    useState(maxReviewAverageValue)

  function wrapYearMonthFilter(
    filter: YearMonthFilter | undefined,
  ): [YearMonth, (value: YearMonth) => void] {
    const [valueRt, setValueRt] = useState(
      filter?.value ?? { year: 2020, month: 1 },
    )
    const setValue = (value: YearMonth): void => {
      setValueRt(value)
      filter?.setValue(value)
    }
    return [valueRt, setValue]
  }
  const [timeStartValue, setTimeStart] = wrapYearMonthFilter(timeStart)
  const [timeEndValue, setTimeEnd] = wrapYearMonthFilter(timeEnd)
  return (
    <div>
      <OpenFiltersButton
        isOpen={isOpen}
        setIsOpen={props.filterState.setIsOpen}
      />
      {isOpen && (
        <FilterControls>
          <MinimumReviewCount
            minReviewCount={minReviewCountValue}
            setMinReviewCount={setMinReviewCount}
          />
          <MaximumReviewCount
            maxReviewCount={maxReviewCountValue}
            setMaxReviewCount={setMaxReviewCount}
          />
          <StepFilterSlider
            title={`Minimum review average: ${minReviewAverageDisplayValue}`}
            min={4}
            max={10}
            step={0.1}
            value={minReviewAverageValue}
            setDisplayValue={setMinReviewAverageDisplayValue}
            setValue={setMinReviewAverage}
          />
          <StepFilterSlider
            title={`Maximum review average: ${maxReviewAverageDisplayValue}`}
            min={4}
            max={10}
            step={0.1}
            value={maxReviewAverageValue}
            setDisplayValue={setMaxReviewAverageDisplayValue}
            setValue={setMaxReviewAverage}
          />
          {timeStart && (
            <TimeFilterSlider
              title={'Minimum time'}
              minTime={timeStart.min}
              maxTime={timeStart.max}
              setTime={setTimeStart}
              time={timeStartValue}
            />
          )}
          {timeEnd && (
            <TimeFilterSlider
              title={'Maximum time'}
              minTime={timeEnd.min}
              maxTime={timeEnd.max}
              setTime={setTimeEnd}
              time={timeEndValue}
            />
          )}
        </FilterControls>
      )}
    </div>
  )
}

export default Filters
