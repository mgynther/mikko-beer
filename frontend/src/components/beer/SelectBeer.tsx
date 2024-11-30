import React from 'react'

import type {
  BeerWithIds,
  SelectBeerIf
} from '../../core/beer/types'
import type { SearchIf } from '../../core/search/types'

import SelectCreateRadio, { Mode } from '../common/SelectCreateRadio'

import CreateBeer from './CreateBeer'
import SearchBeer from './SearchBeer'

import './SelectBeer.css'

export interface Props {
  searchIf: SearchIf
  selectBeerIf: SelectBeerIf
  select: (beer: BeerWithIds) => void
}

function SelectBeer (props: Props): React.JSX.Element {
  return (
    <div className="SelectBeer">
      <SelectCreateRadio
        defaultMode={Mode.CREATE}
        createElement={
          <CreateBeer
            createBeerIf={props.selectBeerIf.create}
            searchIf={props.searchIf}
            select={props.select}
          />
        }
        selectElement={
          <SearchBeer
            searchIf={props.searchIf}
            searchBeerIf={props.selectBeerIf.search}
            select={props.select}
          />
        }
      />
    </div>
  )
}

export default SelectBeer
