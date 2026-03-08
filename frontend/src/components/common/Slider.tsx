import React from 'react'

interface Props {
  id: string
  className: string | undefined
  value: number
  min: number
  max: number
  step: number
  setValue: (value: number) => void
}

function Slider (props: Props): React.JSX.Element {
  return (
    <input
      id={props.id}
      className={props.className ?? ''}
      type='range'
      min={props.min}
      max={props.max}
      step={props.step}
      value={props.value}
      onChange={e => { props.setValue(parseFloat(e.target.value)) }}
    />
  )
}

export default Slider
