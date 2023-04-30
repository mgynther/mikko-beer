import { useState } from 'react'

import { useCreateStyleMutation } from '../store/style/api'
import { type Style } from '../store/style/types'

import LoadingIndicator from './LoadingIndicator'
import StyleParents from './StyleParents'

export interface Props {
  select: (style: Style) => void
}

function CreateStyle (props: Props): JSX.Element {
  const [name, setName] = useState('')
  const [parents, setParents] = useState<string[]>([])
  const [
    createStyle,
    { isLoading: isCreating }
  ] = useCreateStyleMutation()

  async function doCreate (): Promise<void> {
    try {
      const result = await createStyle({ name, parents }).unwrap()
      props.select(result.style)
    } catch (e) {
      console.warn('Failed to create style', e)
    }
  }

  return (
    <div>
      <h5>Create style</h5>
      <div>
        <input
          type='text'
          placeholder='Name'
          value={name}
          onChange={e => { setName(e.target.value) }}
        />
        <StyleParents select={(parents) => { setParents(parents) }} />
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

export default CreateStyle
