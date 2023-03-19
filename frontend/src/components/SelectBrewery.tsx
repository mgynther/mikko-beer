import { type Brewery } from '../store/brewery/types'

import CreateBrewery from './CreateBrewery'
import SearchBrewery from './SearchBrewery'
import SelectCreateRadio, { Mode } from './SelectCreateRadio'

import './SelectBrewery.css'

export interface Props {
  select: (brewery: Brewery) => void
  remove: () => void
}

function SelectBrewery (props: Props): JSX.Element {
  return (
    <div className="SelectBrewery">
      <h4>Select or create brewery</h4>
      <SelectCreateRadio
        defaultMode={Mode.SELECT}
        createElement={
          <CreateBrewery select={props.select} />
        }
        selectElement={
          <SearchBrewery select={props.select} />
        }
      />
      <button onClick={props.remove}>Remove</button>
    </div>
  )
}

export default SelectBrewery
