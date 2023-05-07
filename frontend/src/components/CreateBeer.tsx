import { useState } from 'react'

import { useCreateBeerMutation } from '../store/beer/api'
import { type BeerWithIds } from '../store/beer/types'

import SelectBreweries from './brewery/SelectBreweries'
import SelectStyles from './SelectStyles'

import './CreateBeer.css'

export interface Props {
  select: (beer: BeerWithIds) => void
}

function CreateBeer (props: Props): JSX.Element {
  const [name, setName] = useState('')
  const [breweryIds, setBreweryIds] = useState<string[]>([])
  const [styleIds, setStyleIds] = useState<string[]>([])
  const [
    createBeer,
    { isLoading: isCreating }
  ] = useCreateBeerMutation()
  const isDataMissing =
    name.length === 0 || breweryIds.length === 0 || styleIds.length === 0

  async function doCreate (): Promise<void> {
    try {
      const result = await createBeer({
        name,
        breweries: breweryIds,
        styles: styleIds
      }).unwrap()
      props.select(result.beer)
    } catch (e) {
      console.warn('Failed to create brewery', e)
    }
  }

  return (
    <div>
      <div className={'Section'}>
        <input
          placeholder='Name'
          type="text"
          onChange={(e) => { setName(e.target.value) }}
        />
      </div>
      <div className={'Section'}>
        <SelectBreweries
          select={(breweryIds) => { setBreweryIds(breweryIds) }}
        />
      </div>
      <div className={'Section'}>
        <SelectStyles
          select={(styleIds) => { setStyleIds(styleIds) }}
        />
      </div>
      <button
        disabled={isDataMissing || isCreating}
        onClick={() => { void doCreate() }}
      >Create beer</button>
    </div>
  )
}

export default CreateBeer
