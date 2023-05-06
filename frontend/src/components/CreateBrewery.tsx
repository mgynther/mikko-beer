import { useState } from 'react'

import { useCreateBreweryMutation } from '../store/brewery/api'
import { type Brewery } from '../store/brewery/types'

import BreweryEditor from './BreweryEditor'
import LoadingIndicator from './LoadingIndicator'

export interface Props {
  select: (brewery: Brewery) => void
}

function CreateBrewery (props: Props): JSX.Element {
  const [initialBrewery] = useState<Brewery>({
    id: 'newbrewery',
    name: ''
  })
  const [newBrewery, setNewBrewery] = useState<Brewery | undefined>(undefined)
  const [
    createBrewery,
    { isLoading: isCreating }
  ] = useCreateBreweryMutation()

  async function doCreate (): Promise<void> {
    if (newBrewery === undefined) {
      throw new Error('brewery must not be undefined when creating')
    }
    try {
      const result = await createBrewery(newBrewery.name).unwrap()
      props.select(result.brewery)
    } catch (e) {
      console.warn('Failed to create brewery', e)
    }
  }

  return (
    <>
      <BreweryEditor
        brewery={initialBrewery}
        placeholder='Create brewery'
        onChange={(brewery: Brewery | undefined) => { setNewBrewery(brewery) }}
      />
      <button
        disabled={newBrewery === undefined}
        onClick={() => { void doCreate() }}
      >
        Create
      </button>
      {isCreating && <LoadingIndicator isLoading={isCreating} />}
    </>
  )
}

export default CreateBrewery
