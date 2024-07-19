import { useState } from 'react'

import type {
  Brewery,
  SelectBreweryIf
} from '../../core/brewery/types'

import { Mode, SelectCreateRadioBasic } from '../common/SelectCreateRadio'

import CreateBrewery from './CreateBrewery'
import SearchBrewery from './SearchBrewery'

export interface Props {
  selectBreweryIf: SelectBreweryIf
  select: (brewery: Brewery) => void
  isRemoveVisible: boolean
  remove: () => void
}

function SelectBrewery (props: Props): JSX.Element {
  const [mode, setMode] = useState(Mode.SELECT)
  return (
    <div className="SelectBrewery">
      <SelectCreateRadioBasic
        mode={mode}
        onChange={(mode: Mode) => { setMode(mode) }}
      />
      <div className='SelectBreweryContent'>
        {mode === Mode.CREATE && (
          <CreateBrewery
            createBreweryIf={props.selectBreweryIf.create}
            select={props.select}
          />
        )}
        {mode === Mode.SELECT && (
          <SearchBrewery
            searchBreweryIf={props.selectBreweryIf.search}
            select={props.select}
          />
        )}
        {props.isRemoveVisible && (
          <button onClick={props.remove}>Remove</button>
        )}
      </div>
    </div>
  )
}

export default SelectBrewery
