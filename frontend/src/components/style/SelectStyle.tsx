import { useState } from 'react'

import { type Style } from '../../store/style/types'

import { Mode, SelectCreateRadioBasic } from '../SelectCreateRadio'

import CreateStyle from './CreateStyle'
import SearchStyle from './SearchStyle'

import './SelectStyle.css'

export interface Props {
  select: (style: Style) => void
  remove: () => void
}

function SelectStyle (props: Props): JSX.Element {
  const [mode, setMode] = useState(Mode.SELECT)
  return (
    <div className="SelectStyle">
      <SelectCreateRadioBasic
        mode={mode}
        onChange={(mode: Mode) => { setMode(mode) }}
      />
      <div className='SelectStyleContent'>
        {mode === Mode.CREATE && (
          <>
            <CreateStyle select={props.select} remove={props.remove} />
          </>
        )}
        {mode === Mode.SELECT && (
          <>
            <SearchStyle select={props.select} />
            <button onClick={props.remove}>Remove</button>
          </>
        )}
      </div>
    </div>
  )
}

export default SelectStyle
