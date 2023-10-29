import { useState } from 'react'

import { type StyleWithParentIds } from '../../store/style/types'

import { EditableMode } from '../common/EditableMode'
import EditButton from '../common/EditButton'

import UpdateStyle from './UpdateStyle'

import '../common/FlexRow.css'

interface Props {
  style: StyleWithParentIds
}

function Style (props: Props): JSX.Element {
  const [mode, setMode] = useState(EditableMode.View)
  const [initialStyle, setInitialStyle] =
    useState<StyleWithParentIds | undefined>(undefined)
  return (
    <>
      {mode === EditableMode.View && (
        <div className='FlexRow'>
          <div>{props.style.name}</div>
          <div>
            <EditButton
              disabled={false}
              onClick={() => {
                setMode(EditableMode.Edit)
                setInitialStyle({ ...props.style })
              }}
            />
          </div>
        </div>
      )}
      {mode === EditableMode.Edit && initialStyle !== undefined && (
        <div>
          <UpdateStyle
            initialStyle={initialStyle}
            onCancel={() => {
              setInitialStyle(undefined)
              setMode(EditableMode.View)
            }}
            onSaved={() => {
              setMode(EditableMode.View)
            }}
          />
        </div>
      )}
    </>
  )
}

export default Style
