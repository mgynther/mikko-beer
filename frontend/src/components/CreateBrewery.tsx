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
    <>
      <input
        type='text'
        placeholder='Create brewery'
        value={name}
        onChange={e => { setName(e.target.value) }}
      />
      <button
        disabled={name.trim().length === 0}
        onClick={() => { void doCreate() }}
      >
        Create
      </button>
      {isCreating && <LoadingIndicator isLoading={isCreating} />}
    </>
  )
}

export default CreateBrewery
