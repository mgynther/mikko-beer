import React, { useState } from 'react'

import type { SearchIf } from '../../core/search/types'
import type {
  ListStylesIf,
  StyleWithParents,
  StyleWithParentIds
} from '../../core/style/types'

import StyleParents from './StyleParents'

interface Props {
  listStylesIf: ListStylesIf
  initialStyle: StyleWithParents
  hasError: boolean
  onChange: (style: StyleWithParentIds | undefined) => void
  searchIf: SearchIf
}

function StyleEditor (props: Props): React.JSX.Element {
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
        listStylesIf={props.listStylesIf}
        searchIf={props.searchIf}
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
