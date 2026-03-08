import React from 'react'

import type {
  StatsNoTimeFilters,
  YearMonthFilter
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

function Filters (props: Props): React.JSX.Element {
  const { isOpen } = props
  function getOpenSymbol (isOpen: boolean): string {
    return isOpen ? '▲' : '▼'
  }
  const {
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage,
  } = props.filters
  const { timeStart, timeEnd } = props
  return (
    <div>
      <div className='Toggle'>
        <TabButton
          isCompact={true}
          isSelected={false}
          onClick={() => { props.setIsOpen(!isOpen) }}
          title={`Filters ${getOpenSymbol(isOpen)}`}
        />
      </div>
      {isOpen && (
        <div className='FilterControls'>
          <MinimumReviewCount
            minReviewCount={minReviewCount.value}
            setMinReviewCount={minReviewCount.setValue}
          />
          <MaximumReviewCount
            maxReviewCount={maxReviewCount.value}
            setMaxReviewCount={maxReviewCount.setValue}
          />
          <StepFilterSlider
            title={`Minimum review average: ${minReviewAverage.value}`}
            min={4}
            max={10}
            step={0.1}
            value={minReviewAverage.value}
            setValue={minReviewAverage.setValue}
          />
          <StepFilterSlider
            title={`Maximum review average: ${maxReviewAverage.value}`}
            min={4}
            max={10}
            step={0.1}
            value={maxReviewAverage.value}
            setValue={maxReviewAverage.setValue}
          />
          {timeStart && <TimeFilterSlider
            title={'Minimum time'}
            minTime={timeStart.min}
            maxTime={timeStart.max}
            setTime={timeStart.setValue}
            time={timeStart.value}
          />}
          {timeEnd && <TimeFilterSlider
            title={'Maximum time'}
            minTime={timeEnd.min}
            maxTime={timeEnd.max}
            setTime={timeEnd.setValue}
            time={timeEnd.value}
          />}
        </div>
      )}
    </div>
  )
}

export default Filters
