import { useState } from 'react'

import { useCreateStyleMutation } from '../../store/style/api'
import { type Style } from '../../store/style/types'

import LoadingIndicator from '../LoadingIndicator'

import StyleParents from './StyleParents'

import './CreateStyle.css'

export interface Props {
  select: (style: Style) => void
  remove: () => void
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
      <div className='NameContainer'>
        <input
          type='text'
          placeholder='Name'
          value={name}
          onChange={e => { setName(e.target.value) }}
        />
      </div>
      <StyleParents select={(parents) => { setParents(parents) }} />
      <div className='ButtonContainer'>
        <button
          disabled={name.trim().length === 0}
          onClick={() => { void doCreate() }}
        >
          Create
        </button>
        <button onClick={() => { props.remove() }}>Remove</button>
      </div>
      <LoadingIndicator isLoading={isCreating} />
    </div>
  )
}

export default CreateStyle
