import React from 'react'

import ValueFilterSlider from './ValueFilterSlider'

interface Props {
  minReviewCount: number
  setMinReviewCount: (minimumReviewCount: number) => void
}

function MinimumReviewCount (props: Props): React.JSX.Element {
  const sliderValues = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
  return (
    <ValueFilterSlider
      title={`Minimum review count: ${props.minReviewCount}`}
      value={props.minReviewCount}
      values={sliderValues}
      setValue={props.setMinReviewCount}
    />
  )
}

export default MinimumReviewCount
