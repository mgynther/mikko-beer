import { useState } from 'react'

import { useCreateBeerMutation } from '../../store/beer/api'
import { type BeerWithIds } from '../../core/beer/types'

import BeerEditor from './BeerEditor'

import './CreateBeer.css'
import type { SelectStyleIf } from '../../core/style/types'

export interface Props {
  selectStyleIf: SelectStyleIf
  select: (beer: BeerWithIds) => void
}

function CreateBeer (props: Props): JSX.Element {
  const [beer, setBeer] = useState<BeerWithIds | undefined>(undefined)
  const [
    createBeer,
    { isLoading: isCreating }
  ] = useCreateBeerMutation()

  async function doCreate (): Promise<void> {
    if (beer === undefined) return
    try {
      const result = await createBeer({
        name: beer.name,
        breweries: beer.breweries,
        styles: beer.styles
      }).unwrap()
      props.select(result.beer)
    } catch (e) {
      console.warn('Failed to create brewery', e)
    }
  }

  return (
    <div>
      <BeerEditor
        selectStyleIf={props.selectStyleIf}
        initialBeer={undefined}
        onChange={setBeer}
      />
      <button
        disabled={beer === undefined || isCreating}
        onClick={() => { void doCreate() }}
      >Create beer</button>
    </div>
  )
}

export default CreateBeer
