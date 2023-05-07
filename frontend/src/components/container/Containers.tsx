import { useListContainersQuery } from '../../store/container/api'
import { type Container } from '../../store/container/types'

import LoadingIndicator from '../common/LoadingIndicator'

function Containers (): JSX.Element {
  const { data: containerData, isLoading } = useListContainersQuery()

  const containerArray = containerData?.containers === undefined
    ? []
    : [...containerData.containers]
  const containers = containerArray.sort((a, b) => {
    if (a.type === b.type) {
      return parseFloat(a.size) - parseFloat(b.size)
    }
    return a.type.localeCompare(b.type)
  })

  return (
    <div>
      <h3>Containers</h3>
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {containers.map((container: Container) => (
          <li key={container.id}>
            {`${container.type} ${container.size}`}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Containers
