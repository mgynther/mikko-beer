interface Props {
  isLoading: boolean
}

function LoadingIndicator (props: Props): JSX.Element {
  if (props.isLoading) return <div>Loading...</div>
  return <div/>
}

export default LoadingIndicator
