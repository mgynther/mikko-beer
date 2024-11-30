import React from 'react'

import Slider from '../common/Slider'

import './StepFilterSlider.css'

interface Props {
  title: string
  value: number
  min: number
  max: number
  step: number
  setValue: (value: number) => void
}

function StepFilterSlider (props: Props): React.JSX.Element {
  return (
    <div>
      <div className='StepFilterSliderLabel'>
        {props.title}
      </div>
      <Slider
        className='StepFilterSlider'
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        setValue={props.setValue}
      />
    </div>
  )
}

export default StepFilterSlider
