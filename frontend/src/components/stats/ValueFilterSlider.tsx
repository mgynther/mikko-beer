import React from 'react'

import StepFilterSlider from './StepFilterSlider'

interface Props {
  title: string
  value: number
  values: number[]
  setDisplayValue: (value: number) => void
  setValue: (index: number) => void
}

function ValueFilterSlider(props: Props): React.JSX.Element {
  function getSliderValue(index: number): number {
    return props.values[index]
  }
  function setSliderDisplayValue(index: number): void {
    props.setDisplayValue(getSliderValue(index))
  }
  function setSliderValue(index: number): void {
    props.setValue(getSliderValue(index))
  }
  const index = props.values.indexOf(props.value)
  const validatedIndex = index >= 0 ? index : 0
  return (
    <StepFilterSlider
      title={props.title}
      min={0}
      max={props.values.length - 1}
      step={1}
      value={validatedIndex}
      setDisplayValue={setSliderDisplayValue}
      setValue={setSliderValue}
    />
  )
}

export default ValueFilterSlider
