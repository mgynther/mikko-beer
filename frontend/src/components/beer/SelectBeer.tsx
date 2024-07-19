import type {
  BeerWithIds,
  CreateBeerIf
} from '../../core/beer/types'

import SelectCreateRadio, { Mode } from '../common/SelectCreateRadio'

import CreateBeer from './CreateBeer'
import SearchBeer from './SearchBeer'

import './SelectBeer.css'

export interface Props {
  createBeerIf: CreateBeerIf
  select: (beer: BeerWithIds) => void
}

function SelectBeer (props: Props): JSX.Element {
  return (
    <div className="SelectBeer">
      <SelectCreateRadio
        defaultMode={Mode.CREATE}
        createElement={
          <CreateBeer
            createBeerIf={props.createBeerIf}
            select={props.select}
          />
        }
        selectElement={
          <SearchBeer
            select={props.select}
          />
        }
      />
    </div>
  )
}

export default SelectBeer
