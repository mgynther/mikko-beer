import React, { useState } from 'react'

import ValueFilterSlider from './ValueFilterSlider'

interface Props {
  minReviewCount: number
  setMinReviewCount: (minimumReviewCount: number) => void
}

function MinimumReviewCount (props: Props): React.JSX.Element {
  const [displayValue, setDisplayValue] = useState(props.minReviewCount)
  const sliderValues = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
  return (
    <ValueFilterSlider
      title={`Minimum review count: ${displayValue}`}
      value={props.minReviewCount}
      values={sliderValues}
      setDisplayValue={setDisplayValue}
      setValue={props.setMinReviewCount}
    />
  )
}

export default MinimumReviewCount
