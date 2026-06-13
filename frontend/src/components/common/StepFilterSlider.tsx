import React from 'react'

import Slider from '../common/Slider'

import './StepFilterSlider.css'

interface Props {
  title: string
  value: number
  min: number
  max: number
  step: number
  setDisplayValue: (value: number) => void
  setValue: (value: number) => void
}

function StepFilterSlider(props: Props): React.JSX.Element {
  const id = props.title.split(':')[0]
  return (
    <div>
      <label htmlFor={id} className='StepFilterSliderLabel'>
        {props.title}
      </label>
      <Slider
        id={id}
        className='StepFilterSlider'
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        setDisplayValue={props.setDisplayValue}
        setValue={props.setValue}
      />
    </div>
  )
}

export default StepFilterSlider
