import React, { useState } from 'react'

import type {
  Container,
  UpdateContainerIf
} from '../../core/container/types'

import EditActions from '../common/EditActions'

import ContainerEditor from './ContainerEditor'

interface Props {
  initialContainer: Container
  updateContainerIf: UpdateContainerIf
  onCancel: () => void
  onSaved: () => void
}

function UpdateContainer (props: Props): React.JSX.Element {
  const { update, isLoading } = props.updateContainerIf.useUpdate()
  const [newContainer, setNewContainer] =
    useState<Container | undefined>(undefined)
  async function doUpdate (newContainer: Container): Promise<void> {
    await update({ ...newContainer })
    props.onSaved()
  }
  return (
    <>
      <ContainerEditor
        initialContainer={props.initialContainer}
        onChange={(container: Container | undefined) => {
          setNewContainer(container)
        }}
      />
      <EditActions
        isSaveDisabled={newContainer === undefined}
        isSaving={isLoading}
        onCancel={() => {
          setNewContainer(undefined)
          props.onCancel()
        }}
        onSave={
          newContainer
            ? (): void => { void doUpdate(newContainer) }
            : undefined
        }
      />
    </>
  )
}

export default UpdateContainer
