import { useState } from 'react'

import MaximumReviewCount from './MaximumReviewCount'
import MinimumReviewCount from './MinimumReviewCount'
import StepFilterSlider from './StepFilterSlider'

import TabButton from '../common/TabButton'

import './Filters.css'

interface Props {
  minReviewCount: number
  setMinReviewCount: (minimumReviewCount: number) => void
  maxReviewCount: number
  setMaxReviewCount: (maximumReviewCount: number) => void
  minReviewAverage: number
  setMinReviewAverage: (minimumReviewAverage: number) => void
  maxReviewAverage: number
  setMaxReviewAverage: (maximumReviewAverage: number) => void
}

function Filters (props: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  function getOpenSymbol (isOpen: boolean): string {
    return isOpen ? '▲' : '▼'
  }
  return (
    <div>
      <div className='Toggle'>
        <TabButton
          isCompact={true}
          isSelected={false}
          onClick={() => { setIsOpen(!isOpen) }}
          title={`Filters ${getOpenSymbol(isOpen)}`}
        />
      </div>
      {isOpen && (
        <div className='FilterControls'>
          <MinimumReviewCount
            minReviewCount={props.minReviewCount}
            setMinReviewCount={props.setMinReviewCount}
          />
          <MaximumReviewCount
            maxReviewCount={props.maxReviewCount}
            setMaxReviewCount={props.setMaxReviewCount}
          />
          <StepFilterSlider
            title={`Minimum review average: ${props.minReviewAverage}`}
            min={4}
            max={10}
            step={0.1}
            value={props.minReviewAverage}
            setValue={props.setMinReviewAverage}
          />
          <StepFilterSlider
            title={`Maximum review average: ${props.maxReviewAverage}`}
            min={4}
            max={10}
            step={0.1}
            value={props.maxReviewAverage}
            setValue={props.setMaxReviewAverage}
          />
        </div>
      )}
    </div>
  )
}

export default Filters
