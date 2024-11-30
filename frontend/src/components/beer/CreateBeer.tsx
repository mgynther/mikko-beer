import React, { useState } from 'react'

import type {
  BeerWithIds,
  CreateBeerIf
} from '../../core/beer/types'
import type { SearchIf } from '../../core/search/types'

import BeerEditor from './BeerEditor'

import './CreateBeer.css'

export interface Props {
  createBeerIf: CreateBeerIf
  searchIf: SearchIf
  select: (beer: BeerWithIds) => void
}

function CreateBeer (props: Props): React.JSX.Element {
  const [beer, setBeer] = useState<BeerWithIds | undefined>(undefined)
  const { create, isLoading } = props.createBeerIf.useCreate()

  async function doCreate (): Promise<void> {
    if (beer === undefined) return
    try {
      const result = await create({
        name: beer.name,
        breweries: beer.breweries,
        styles: beer.styles
      })
      props.select(result)
    } catch (e) {
      console.warn('Failed to create brewery', e)
    }
  }

  return (
    <div>
      <BeerEditor
        editBeerIf={props.createBeerIf.editBeerIf}
        initialBeer={undefined}
        onChange={setBeer}
        searchIf={props.searchIf}
      />
      <button
        disabled={beer === undefined || isLoading}
        onClick={() => { void doCreate() }}
      >Create beer</button>
    </div>
  )
}

export default CreateBeer
