import { type BeerWithIds } from '../store/beer/types'

import CreateBeer from './CreateBeer'
import SearchBeer from './SearchBeer'
import SelectCreateRadio, { Mode } from './SelectCreateRadio'

import './SelectBeer.css'

export interface Props {
  select: (beer: BeerWithIds) => void
}

function SelectBeer (props: Props): JSX.Element {
  return (
    <div className="SelectBeer">
      <h4>Select or create beer</h4>
      <SelectCreateRadio
        defaultMode={Mode.CREATE}
        createElement={
          <CreateBeer select={props.select} />
        }
        selectElement={
          <SearchBeer select={props.select} />
        }
      />
    </div>
  )
}

export default SelectBeer
