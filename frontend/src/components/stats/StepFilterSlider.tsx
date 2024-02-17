import './StepFilterSlider.css'

interface Props {
  title: string
  value: number
  min: number
  max: number
  step: number
  setValue: (value: number) => void
}

function StepFilterSlider (props: Props): JSX.Element {
  return (
    <div>
      <div className='StepFilterSliderLabel'>
        {props.title}
      </div>
      <input
        className='StepFilterSlider'
        type='range'
        id='rating'
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={e => { props.setValue(parseFloat(e.target.value)) }}
      />
    </div>
  )
}

export default StepFilterSlider
