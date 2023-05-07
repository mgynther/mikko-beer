import { useState } from 'react'

import { useCreateContainerMutation } from '../../store/container/api'
import { type Container } from '../../store/container/types'

import LoadingIndicator from '../common/LoadingIndicator'

export interface Props {
  select: (container: Container) => void
}

function CreateContainer (props: Props): JSX.Element {
  const [type, setType] = useState('')
  const [size, setSize] = useState('')
  const [
    createContainer,
    { isLoading: isCreating }
  ] = useCreateContainerMutation()

  async function doCreate (): Promise<void> {
    try {
      const result = await createContainer({
        type: type.trim(),
        size: size.trim()
      }).unwrap()
      props.select(result.container)
    } catch (e) {
      console.warn('Failed to create container', e)
    }
  }

  function isSizeValid (size: string): boolean {
    return /^[0-9].[0-9]{2}$/.test(size.trim())
  }

  return (
    <>
      <input
        type='text'
        placeholder='Type'
        value={type}
        onChange={e => { setType(e.target.value) }}
      />
      <input
        type='text'
        placeholder='Size, for example 0.25'
        value={size}
        onChange={e => { setSize(e.target.value) }}
      />
      <button
        disabled={type.trim().length === 0 || !isSizeValid(size)}
        onClick={() => { void doCreate() }}
      >
        Create
      </button>
      {isCreating && <LoadingIndicator isLoading={isCreating} />}
    </>
  )
}

export default CreateContainer
