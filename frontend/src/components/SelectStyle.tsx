import { type Style } from '../store/style/types'

import CreateStyle from './CreateStyle'
import SearchStyle from './SearchStyle'
import SelectCreateRadio, { Mode } from './SelectCreateRadio'

import './SelectStyle.css'

export interface Props {
  select: (style: Style) => void
  remove: () => void
}

function SelectStyle (props: Props): JSX.Element {
  return (
    <div className="SelectStyle">
      <h4>Select or create style</h4>
      <SelectCreateRadio
        defaultMode={Mode.SELECT}
        createElement={
          <CreateStyle select={props.select} />
        }
        selectElement={
          <SearchStyle select={props.select} />
        }
      />
      <button onClick={props.remove}>Remove</button>
    </div>
  )
}

export default SelectStyle
