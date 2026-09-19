import React, { useState } from 'react'

import ValueFilterSlider from './ValueFilterSlider'

interface Props {
  maxReviewCount: number
  setMaxReviewCount: (maximumReviewCount: number) => void
}

function MaximumReviewCount(props: Props): React.JSX.Element {
  const [displayValue, setDisplayValue] = useState(props.maxReviewCount)
  const sliderValues = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, Infinity]
  function getCountSymbol(count: number): string {
    if (!isFinite(count)) return '∞'
    return `${count}`
  }
  return (
    <ValueFilterSlider
      title={`Maximum review count: ${getCountSymbol(displayValue)}`}
      value={props.maxReviewCount}
      values={sliderValues}
      setDisplayValue={setDisplayValue}
      setValue={props.setMaxReviewCount}
    />
  )
}

export default MaximumReviewCount
