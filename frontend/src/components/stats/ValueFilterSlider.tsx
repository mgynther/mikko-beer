import './Filters.css'

interface Props {
  title: string
  value: number
  values: number[]
  setValue: (index: number) => void
}

function ValueFilterSlider (props: Props): JSX.Element {
  function setSliderValue (index: number): void {
    props.setValue(props.values[index])
  }
  const index = props.values.indexOf(props.value)
  const validatedIndex = index >= 0 ? index : 0
  return (
    <div>
      <div className='FilterSliderLabel'>
        {props.title}
      </div>
      <input
        className='FilterSlider'
        type='range'
        id='rating'
        min={0}
        max={props.values.length - 1}
        step={1}
        value={validatedIndex}
        onChange={e => { setSliderValue(parseInt(e.target.value)) }}
      />
    </div>
  )
}

export default ValueFilterSlider
