interface Props {
  className: string | undefined
  value: number
  min: number
  max: number
  step: number
  setValue: (value: number) => void
}

function Slider (props: Props): JSX.Element {
  return (
    <input
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
