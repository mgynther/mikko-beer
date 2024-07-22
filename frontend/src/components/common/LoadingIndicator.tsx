interface Props {
  isLoading: boolean
}

export const loadingIndicatorText = 'Loading...'

function LoadingIndicator (props: Props): JSX.Element {
  if (props.isLoading) return <div>{loadingIndicatorText}</div>
  return <div/>
}

export default LoadingIndicator
