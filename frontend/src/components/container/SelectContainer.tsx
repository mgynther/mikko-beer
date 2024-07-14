import {
  type Container,
  type CreateContainerIf,
  type ListContainersIf
} from '../../core/container/types'

import LoadingIndicator from '../common/LoadingIndicator'
import SelectCreateRadio, { Mode } from '../common/SelectCreateRadio'

import CreateContainer from './CreateContainer'

export interface Props {
  select: (container: Container) => void
  createContainerIf: CreateContainerIf,
  listContainersIf: ListContainersIf
}

function SelectContainer (props: Props): JSX.Element {
  const { data: containerData, isLoading } = props.listContainersIf.useList()

  function selectContainerById (containerId: string): void {
    const container = containerData?.containers
      .find((container) => container.id === containerId)
    if (container === undefined) return
    props.select(container)
  }

  return (
    <div>
      <SelectCreateRadio
        defaultMode={Mode.SELECT}
        createElement={
          <CreateContainer
            select={props.select}
            createContainerIf={props.createContainerIf}
          />
        }
        selectElement={
          <div>
            <LoadingIndicator isLoading={isLoading} />
            <select
              defaultValue={''}
              onChange={(e) => { selectContainerById(e.target.value) }}
            >
              <option value={''} disabled={true} />
              {containerData?.containers.map((container: Container) => (
                <option key={container.id} value={container.id}>
                  {container.type} {container.size}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </div>
  )
}

export default SelectContainer
