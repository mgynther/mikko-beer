import { useState } from 'react'

import {
  type Container as ContainerType,
  type UpdateContainerIf
} from '../../core/container/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'

import UpdateContainer from './UpdateContainer'

import '../common/FlexRow.css'
import type { GetLogin } from '../../core/login/types'

interface Props {
  container: ContainerType
  getLogin: GetLogin
  updateContainerIf: UpdateContainerIf
}

function Container (props: Props): JSX.Element {
  const [mode, setMode] = useState(EditableMode.View)
  const [initialContainer, setInitialContainer] =
    useState<ContainerType | undefined>(undefined)
  return (
    <>
      {mode === EditableMode.View && (
        <div className='FlexRow'>
          <div>{`${props.container.type} ${props.container.size}`}</div>
          <div>
            <EditButton
              disabled={false}
              getLogin={props.getLogin}
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
            updateContainerIf={props.updateContainerIf}
          />
        </div>
      )}
    </>
  )
}

export default Container
