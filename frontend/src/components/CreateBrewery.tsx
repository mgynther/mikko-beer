import { useState } from 'react'

import { useCreateBreweryMutation } from '../store/brewery/api'
import { type Brewery } from '../store/brewery/types'

import LoadingIndicator from './LoadingIndicator'

export interface Props {
  select: (brewery: Brewery) => void
}

function CreateBrewery (props: Props): JSX.Element {
  const [name, setName] = useState('')
  const [
    createBrewery,
    { isLoading: isCreating }
  ] = useCreateBreweryMutation()

  async function doCreate (): Promise<void> {
    try {
      const result = await createBrewery(name).unwrap()
      props.select(result.brewery)
    } catch (e) {
      console.warn('Failed to create brewery', e)
    }
  }

  return (
    <div>
      <h5>Create brewery</h5>
      <div>
        <input
          type='text'
          placeholder='Name'
          value={name}
          onChange={e => { setName(e.target.value) }}
        />
        <button
          disabled={name.trim().length === 0}
          onClick={() => { void doCreate() }}
        >
          Create
        </button>
        <LoadingIndicator isLoading={isCreating} />
      </div>
    </div>
  )
}

export default CreateBrewery
