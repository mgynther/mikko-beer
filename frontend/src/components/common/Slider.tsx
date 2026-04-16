import React, { useEffect, useState } from 'react'

interface Props {
  id: string
  className: string | undefined
  value: number
  min: number
  max: number
  step: number
  setValue: (value: number) => void
  setDisplayValue: (value: number) => void
}

function Slider(props: Props): React.JSX.Element {
  const [isTouching, setIsTouching] = useState<boolean>()
  const [pendingValue, setPendingValue] = useState(props.value)
  useEffect(() => {
    if (isTouching === false) {
      props.setValue(pendingValue)
    }
  }, [isTouching])
  return (
    <input
      id={props.id}
      className={props.className ?? ''}
      type='range'
      min={props.min}
      max={props.max}
      step={props.step}
      value={pendingValue}
      onMouseDown={() => {
        setIsTouching(true)
      }}
      onMouseUp={() => {
        setIsTouching(false)
      }}
      onTouchStart={() => {
        setIsTouching(true)
      }}
      onTouchEnd={() => {
        setIsTouching(false)
      }}
      onChange={(e) => {
        const value = parseFloat(e.target.value)
        setPendingValue(value)
        props.setDisplayValue(value)
        if (!isTouching) {
          props.setValue(value)
        }
      }}
    />
  )
}

export default Slider
