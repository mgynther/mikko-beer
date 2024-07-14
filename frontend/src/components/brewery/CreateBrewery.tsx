import { useState } from 'react'

import { useCreateBreweryMutation } from '../../store/brewery/api'
import { type Brewery } from '../../core/brewery/types'

import LoadingIndicator from '../common/LoadingIndicator'

import BreweryEditor from './BreweryEditor'

import '../common/FlexRow.css'

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
      <div className='FlexRow'>
        <BreweryEditor
          brewery={initialBrewery}
          placeholder='Create brewery'
          onChange={(brewery: Brewery | undefined) => {
            setNewBrewery(brewery)
          }}
        />
        <div>
          <button
            disabled={newBrewery === undefined}
            onClick={() => { void doCreate() }}
          >
            Create
          </button>
        </div>
      </div>
      {isCreating && <LoadingIndicator isLoading={isCreating} />}
    </>
  )
}

export default CreateBrewery
