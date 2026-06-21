import React, { useState } from 'react'

import type {
  Container as ContainerType,
  UpdateContainerIf,
} from '../../core/container/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'

import UpdateContainer from './UpdateContainer'

import '../common/FlexRow.css'
import ContainerInfo from './ContainerInfo'

interface Props {
  container: ContainerType
  updateContainerIf: UpdateContainerIf
}

function Container(props: Props): React.JSX.Element {
  const [mode, setMode] = useState(EditableMode.View)
  const [initialContainer, setInitialContainer] = useState<
    ContainerType | undefined
  >(undefined)
  return (
    <>
      {mode === EditableMode.View && (
        <div className='FlexRow'>
          <ContainerInfo container={props.container} />
          <div>
            <EditButton
              disabled={false}
              getLogin={props.updateContainerIf.getLogin}
              onClick={() => {
                setMode(EditableMode.Edit)
                setInitialContainer({ ...props.container })
              }}
            />
          </div>
        </div>
      )}
      {mode === EditableMode.Edit && initialContainer !== undefined && (
        <div>
          <UpdateContainer
            initialContainer={initialContainer}
            onCancel={() => {
              setInitialContainer(undefined)
              setMode(EditableMode.View)
            }}
            onSaved={() => {
              setMode(EditableMode.View)
            }}
            updateContainerHookIf={{
              useUpdate: props.updateContainerIf.useUpdate,
            }}
          />
        </div>
      )}
    </>
  )
}

export default Container
