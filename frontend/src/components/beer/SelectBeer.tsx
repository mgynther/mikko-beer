import React from 'react'

import type { BeerWithIds, SelectBeerIf } from '../../core/beer/types'
import type { SearchFieldIf } from '../../core/search/types'

import SelectCreateRadio, { Mode } from '../common/SelectCreateRadio'

import CreateBeer from './CreateBeer'
import SearchBeer from './SearchBeer'

import './SelectBeer.css'

export interface Props {
  searchFieldIf: SearchFieldIf
  selectBeerIf: SelectBeerIf
  select: (beer: BeerWithIds) => void
}

function SelectBeer(props: Props): React.JSX.Element {
  return (
    <div className='SelectBeer'>
      <SelectCreateRadio
        defaultMode={Mode.CREATE}
        createElement={
          <CreateBeer
            createBeerIf={props.selectBeerIf.create}
            searchFieldIf={props.searchFieldIf}
            select={props.select}
          />
        }
        selectElement={
          <SearchBeer
            searchBeerIf={props.selectBeerIf.search}
            select={props.select}
          />
        }
      />
    </div>
  )
}

export default SelectBeer
