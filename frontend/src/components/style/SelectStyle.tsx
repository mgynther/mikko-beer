import React, { useState } from 'react'

import type { SearchIf } from '../../core/search/types'
import type {
  SelectStyleIf,
  Style
} from '../../core/style/types'

import { Mode, SelectCreateRadioBasic } from '../common/SelectCreateRadio'

import Button from '../common/Button'
import CreateStyle from './CreateStyle'
import SearchStyle from './SearchStyle'

import './SelectStyle.css'

export interface Props {
  searchIf: SearchIf
  selectStyleIf: SelectStyleIf
  select: (style: Style) => void
  remove: () => void
}

function SelectStyle (props: Props): React.JSX.Element {
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
            <CreateStyle
              searchIf={props.searchIf}
              selectStyleIf={props.selectStyleIf}
              select={props.select}
              remove={props.remove}
            />
          </>
        )}
        {mode === Mode.SELECT && (
          <>
            <SearchStyle
              listStylesIf={props.selectStyleIf.list}
              searchIf={props.searchIf}
              select={props.select}
            />
            <Button onClick={props.remove} text='Remove' />
          </>
        )}
      </div>
    </div>
  )
}

export default SelectStyle
