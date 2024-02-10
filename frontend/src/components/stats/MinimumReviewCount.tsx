import './Filters.css'

interface Props {
  minReviewCount: number
  setMinReviewCount: (minimumReviewCount: number) => void
}

function MinimumReviewCount (props: Props): JSX.Element {
  const sliderValues = [1, 2, 3, 5, 8, 13, 21, 34]
  function setSliderValue (index: number): void {
    props.setMinReviewCount(sliderValues[index])
  }
  return (
    <div>
      <div className='FilterSliderLabel'>
        Minimum review count: { `${props.minReviewCount}` }
      </div>
      <input
        className='FilterSlider'
        type='range'
        id='rating'
        min={0}
        max={sliderValues.length - 1}
        step={1}
        value={sliderValues.indexOf(props.minReviewCount)}
        onChange={e => { setSliderValue(parseInt(e.target.value)) }}
      />
    </div>
  )
}

export default MinimumReviewCount
