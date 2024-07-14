import { useListContainersQuery } from '../../store/container/api'
import { type Container as ContainerType } from '../../core/container/types'

import LoadingIndicator from '../common/LoadingIndicator'

import Container from './Container'

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
        {containers.map((container: ContainerType) => (
          <li key={container.id} className='RowLike'>
            <Container container={container} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Containers
