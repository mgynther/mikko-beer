import { useState } from 'react'

import { useUpdateContainerMutation } from '../../store/container/api'
import { type Container } from '../../store/container/types'

import EditActions from '../common/EditActions'

import ContainerEditor from './ContainerEditor'

interface Props {
  initialContainer: Container
  onCancel: () => void
  onSaved: () => void
}

function UpdateContainer (props: Props): JSX.Element {
  const [newContainer, setNewContainer] =
    useState<Container | undefined>(undefined)
  const [updateContainer, { isLoading }] =
    useUpdateContainerMutation()
  async function update (): Promise<void> {
    if (newContainer === undefined) {
      throw new Error('container must not be undefined when updating')
    }
    try {
      await updateContainer({ ...newContainer })
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
        isSaving={isLoading}
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
