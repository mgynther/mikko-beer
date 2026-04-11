import React, { useState } from 'react'

import StepFilterSlider from './StepFilterSlider'
import type { YearMonth } from '../../core/stats/types'
import { pad } from '../util'

interface Props {
  title: string
  minTime: YearMonth
  maxTime: YearMonth
  setTime: (yearMonth: YearMonth) => void
  time: YearMonth
}

function getFormattedTime (yearMonth: YearMonth): string {
  return `${yearMonth.year}-${pad(yearMonth.month)}`
}

function isEarlierOrEqual (a: YearMonth, b: YearMonth): boolean {
  if (a.year < b.year) {
    return true
  }
  if (a.year > b.year) {
    return false
  }
  return a.month <= b.month
}

function getSliderValues (minTime: YearMonth, maxTime: YearMonth): YearMonth[] {
  if (!isEarlierOrEqual(minTime, maxTime)) {
    const formattedMax = getFormattedTime(maxTime)
    const formattedMin = getFormattedTime(minTime)
    throw new Error(
      `maxTime ${formattedMax} cannot be before minTime ${formattedMin}`
    )
  }
  const result: YearMonth[] = []
  const yearMonth: YearMonth = {
    ...minTime
  }
  while (isEarlierOrEqual(yearMonth, maxTime)) {
    result.push({
      ...yearMonth
    })
    if (yearMonth.month === 12) {
      yearMonth.year = yearMonth.year + 1
      yearMonth.month = 1
    } else {
      yearMonth.month = yearMonth.month + 1
    }
  }
  return result
}

function TimeFilterSlider (props: Props): React.JSX.Element {
  const sliderValues = getSliderValues(props.minTime, props.maxTime)
  function findIndex (yearMonth: YearMonth): number {
    const foundIndex = sliderValues.findIndex((candidate) => {
      return candidate.year === yearMonth.year &&
        candidate.month === yearMonth.month
    })
    if (foundIndex >= 0) {
      return foundIndex
    }
    return 0
  }
  const [displayValue, setDisplayValue] =
    useState(sliderValues[findIndex(props.time)])
  return (
    <StepFilterSlider
      title={`${props.title}: ${getFormattedTime(displayValue)}`}
      min={0}
      max={sliderValues.length - 1}
      step={1}
      value={findIndex(props.time)}
      setDisplayValue={(value: number) => setDisplayValue(sliderValues[value])}
      setValue={(value: number) => props.setTime(sliderValues[value])}
    />
  )
}

export default TimeFilterSlider
