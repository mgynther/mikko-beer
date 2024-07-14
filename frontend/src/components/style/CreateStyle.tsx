import { useEffect, useState } from 'react'

import { useCreateStyleMutation } from '../../store/style/api'
import { type Style, type StyleWithParentIds } from '../../core/style/types'

import LoadingIndicator from '../common/LoadingIndicator'

import StyleEditor from './StyleEditor'

import './CreateStyle.css'

export interface Props {
  select: (style: Style) => void
  remove: () => void
}

function CreateStyle (props: Props): JSX.Element {
  const [style, setStyle] = useState<StyleWithParentIds | undefined>(undefined)
  const [
    createStyle,
    { data: createdStyle, isError, isLoading: isCreating, isSuccess }
  ] = useCreateStyleMutation()

  const select = props.select

  useEffect(() => {
    if (isSuccess && createdStyle !== undefined) {
      select(createdStyle.style)
    }
  }, [isSuccess, select, createdStyle])

  async function doCreate (): Promise<void> {
    if (style === undefined) return
    try {
      await createStyle({
        name: style.name,
        parents: style.parents
      })
    } catch (e) {
      console.warn('Failed to create style', e)
    }
  }

  return (
    <div>
      <StyleEditor
        onChange={(style) => { setStyle(style) }}
        initialStyle={{
          id: 'newStyle',
          name: '',
          parents: []
        }}
        hasError={isError}
      />
      <div className='ButtonContainer'>
        <button
          disabled={style === undefined}
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
