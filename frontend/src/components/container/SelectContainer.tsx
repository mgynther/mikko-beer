import React from 'react'

import type { Container } from '../../core/container/types'
import type { ReviewContainerIf } from '../../core/review/types'

import LoadingIndicator from '../common/LoadingIndicator'
import SelectCreateRadio, { Mode } from '../common/SelectCreateRadio'

import CreateContainer from './CreateContainer'
import { asText } from './ContainerInfo'

export interface Props {
  select: (container: Container) => void
  reviewContainerIf: ReviewContainerIf,
}

function SelectContainer (props: Props): React.JSX.Element {
  const { data: containerData, isLoading } =
    props.reviewContainerIf.listIf.useList()

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
            createContainerIf={props.reviewContainerIf.createIf}
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
                  {asText(container)}
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
