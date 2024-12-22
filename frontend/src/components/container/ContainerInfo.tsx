import type { Container } from "../../core/container/types"

interface Props {
  container: Container
}

export function asText(container: Container): string {
  return `${container.type} ${container.size}`
}

function ContainerInfo (props: Props): React.JSX.Element {
  return (
    <div>{asText(props.container)}</div>
  )
}

export default ContainerInfo
