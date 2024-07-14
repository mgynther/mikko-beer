import { type BeerWithIds } from '../../core/beer/types'
import type { SelectStyleIf } from '../../core/style/types'

import SelectCreateRadio, { Mode } from '../common/SelectCreateRadio'

import CreateBeer from './CreateBeer'
import SearchBeer from './SearchBeer'

import './SelectBeer.css'

export interface Props {
  selectStyleIf: SelectStyleIf
  select: (beer: BeerWithIds) => void
}

function SelectBeer (props: Props): JSX.Element {
  return (
    <div className="SelectBeer">
      <SelectCreateRadio
        defaultMode={Mode.CREATE}
        createElement={
          <CreateBeer
            selectStyleIf={props.selectStyleIf}
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
