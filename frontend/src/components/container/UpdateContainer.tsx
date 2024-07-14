import { useState } from 'react'

import {
  type Container,
  type UpdateContainerIf
} from '../../core/container/types'

import EditActions from '../common/EditActions'

import ContainerEditor from './ContainerEditor'

interface Props {
  initialContainer: Container
  updateContainerIf: UpdateContainerIf
  onCancel: () => void
  onSaved: () => void
}

function UpdateContainer (props: Props): JSX.Element {
  const [newContainer, setNewContainer] =
    useState<Container | undefined>(undefined)
  async function update (): Promise<void> {
    if (newContainer === undefined) {
      throw new Error('container must not be undefined when updating')
    }
    try {
      await props.updateContainerIf.update({ ...newContainer })
      props.onSaved()
    } catch (e) {
      console.warn('Failed to update container', e)
    }
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
        isSaving={props.updateContainerIf.isLoading}
        onCancel={() => {
          setNewContainer(undefined)
          props.onCancel()
        }}
        onSave={() => { void update() }}
      />
    </>
  )
}

export default UpdateContainer
