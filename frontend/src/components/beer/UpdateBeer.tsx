import { useState } from 'react'

import { useUpdateBeerMutation } from '../../store/beer/api'
import { type Beer, type BeerWithIds } from '../../core/beer/types'

import EditActions from '../common/EditActions'

import BeerEditor from './BeerEditor'

interface Props {
  initialBeer: Beer
  onCancel: () => void
  onSaved: () => void
}

function UpdateBeer (props: Props): JSX.Element {
  const [newBeer, setNewBeer] = useState<BeerWithIds | undefined>(undefined)
  const [updateBeer, { isLoading }] =
    useUpdateBeerMutation()
  async function update (): Promise<void> {
    if (newBeer === undefined) {
      throw new Error('beer must not be undefined when updating')
    }
    try {
      await updateBeer({ ...newBeer })
      props.onSaved()
    } catch (e) {
      console.warn('Failed to update beer', e)
    }
  }
  return (
    <>
      <BeerEditor
        initialBeer={props.initialBeer}
        onChange={(beer: BeerWithIds | undefined) => {
          setNewBeer(beer)
        }}
      />
      <EditActions
        isSaveDisabled={newBeer === undefined}
        isSaving={isLoading}
        onCancel={() => {
          setNewBeer(undefined)
          props.onCancel()
        }}
        onSave={() => { void update() }}
      />
    </>
  )
}

export default UpdateBeer
