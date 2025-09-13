import React, { useEffect, useState } from 'react'

import type { SearchIf } from '../../core/search/types'
import type {
  SelectStyleIf,
  Style,
  StyleWithParentIds
} from '../../core/style/types'

import Button from '../common/Button'
import LoadingIndicator from '../common/LoadingIndicator'

import StyleEditor from './StyleEditor'

import './CreateStyle.css'

export interface Props {
  searchIf: SearchIf
  selectStyleIf: SelectStyleIf
  select: (style: Style) => void
  remove: () => void
}

function CreateStyle (props: Props): React.JSX.Element {
  const [style, setStyle] = useState<StyleWithParentIds | undefined>(undefined)
  const { create, createdStyle, hasError, isLoading, isSuccess } =
    props.selectStyleIf.create.useCreate()

  const select = props.select

  useEffect(() => {
    if (isSuccess && createdStyle !== undefined) {
      select(createdStyle)
    }
  }, [isSuccess, select, createdStyle])

  async function doCreate (): Promise<void> {
    if (style === undefined) return
    try {
      await create({
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
        listStylesIf={props.selectStyleIf.list}
        hasError={hasError}
        searchIf={props.searchIf}
      />
      <div className='ButtonContainer'>
        <Button
          disabled={style === undefined}
          onClick={() => { void doCreate() }}
          text='Create'
        />
        <Button onClick={() => { props.remove() }} text='Remove' />
      </div>
      <LoadingIndicator isLoading={isLoading} />
    </div>
  )
}

export default CreateStyle
