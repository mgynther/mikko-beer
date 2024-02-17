import StepFilterSlider from './StepFilterSlider'

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
    <StepFilterSlider
      title={props.title}
      min={0}
      max={props.values.length - 1}
      step={1}
      value={validatedIndex}
      setValue={setSliderValue}
    />
  )
}

export default ValueFilterSlider
