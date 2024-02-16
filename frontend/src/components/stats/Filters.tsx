import MaximumReviewCount from './MaximumReviewCount'
import MinimumReviewCount from './MinimumReviewCount'

interface Props {
  minReviewCount: number
  setMinReviewCount: (minimumReviewCount: number) => void
  maxReviewCount: number
  setMaxReviewCount: (maximumReviewCount: number) => void
}

function Filters (props: Props): JSX.Element {
  return (
    <div>
      <MinimumReviewCount
        minReviewCount={props.minReviewCount}
        setMinReviewCount={props.setMinReviewCount}
      />
      <MaximumReviewCount
        maxReviewCount={props.maxReviewCount}
        setMaxReviewCount={props.setMaxReviewCount}
      />
    </div>
  )
}

export default Filters
