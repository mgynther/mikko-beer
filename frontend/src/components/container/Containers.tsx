import {
  type Container as ContainerType,
  type ListContainersIf,
  type UpdateContainerIf
} from '../../core/container/types'
import type { GetLogin } from '../../core/login/types'

import LoadingIndicator from '../common/LoadingIndicator'

import Container from './Container'

interface Props {
  getLogin: GetLogin
  listContainersIf: ListContainersIf
  updateContainerIf: UpdateContainerIf
}

function Containers (props: Props): JSX.Element {
  const { data: containerData, isLoading } = props.listContainersIf.useList()

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
            <Container
              container={container}
              getLogin={props.getLogin}
              updateContainerIf={props.updateContainerIf}
              />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Containers
