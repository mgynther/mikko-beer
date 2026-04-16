import React, { useState } from 'react'

import type {
  StatsFilter,
  StatsNoTimeFilters,
  YearMonth,
  YearMonthFilter,
} from '../../core/stats/types'

import MaximumReviewCount from './MaximumReviewCount'
import MinimumReviewCount from './MinimumReviewCount'
import StepFilterSlider from './StepFilterSlider'

import TabButton from '../common/TabButton'

import './Filters.css'
import TimeFilterSlider from './TimeFilterSlider'

interface Props {
  filters: StatsNoTimeFilters
  timeStart: YearMonthFilter | undefined
  timeEnd: YearMonthFilter | undefined
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

function Filters(props: Props): React.JSX.Element {
  const { isOpen } = props
  function getOpenSymbol(isOpen: boolean): string {
    return isOpen ? '▲' : '▼'
  }
  const { minReviewCount, maxReviewCount, minReviewAverage, maxReviewAverage } =
    props.filters
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
      <div className='Toggle'>
        <TabButton
          isCompact={true}
          isSelected={false}
          onClick={() => {
            props.setIsOpen(!isOpen)
          }}
          title={`Filters ${getOpenSymbol(isOpen)}`}
        />
      </div>
      {isOpen && (
        <div className='FilterControls'>
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
        </div>
      )}
    </div>
  )
}

export default Filters
