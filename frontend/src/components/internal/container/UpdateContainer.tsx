import React, { useState } from 'react'

import type {
  Container,
  UpdateContainerHookIf,
} from '../../types/container/types'

import EditActions from '../common/EditActions'

import ContainerEditor from './ContainerEditor'
import { createErrorLogger } from '../error-logger'

interface Props {
  initialContainer: Container
  updateContainerHookIf: UpdateContainerHookIf
  onCancel: () => void
  onSaved: () => void
}

function UpdateContainer(props: Props): React.JSX.Element {
  const { update, isLoading } = props.updateContainerHookIf.useUpdate()
  const [newContainer, setNewContainer] = useState<Container | undefined>(
    undefined,
  )
  async function doUpdate(newContainer: Container): Promise<void> {
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
            ? (): void => {
                doUpdate(newContainer).catch(
                  createErrorLogger('doUpdate failed', console.error),
                )
              }
            : undefined
        }
      />
    </>
  )
}

export default UpdateContainer
