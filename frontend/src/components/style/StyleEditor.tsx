import { useState } from 'react'

import {
  type StyleWithParents,
  type StyleWithParentIds
} from '../../core/style/types'

import StyleParents from './StyleParents'

interface Props {
  initialStyle: StyleWithParents
  hasError: boolean
  onChange: (style: StyleWithParentIds | undefined) => void
}

function StyleEditor (props: Props): JSX.Element {
  const [name, setName] = useState(props.initialStyle.name)
  const [parents, setParents] = useState<string[]>(
    props.initialStyle.parents.map(style => style.id)
  )

  function onChange (name: string, parents: string[]): void {
    if (name.length > 0) {
      props.onChange({
        id: props.initialStyle.id,
        name,
        parents
      })
      return
    }
    props.onChange(undefined)
  }

  return (
    <>
      <div className='NameContainer'>
        <input
          type='text'
          placeholder='Name'
          value={name}
          onChange={e => {
            const name = e.target.value
            setName(name)
            onChange(name, parents)
          }}
        />
      </div>
      <StyleParents
        initialParents={props.initialStyle.parents}
        select={(parents) => {
          setParents(parents)
          onChange(name, parents)
        }} />
      {props.hasError &&
        <div>Error saving. Please check parents and try again</div>
      }
    </>
  )
}

export default StyleEditor
