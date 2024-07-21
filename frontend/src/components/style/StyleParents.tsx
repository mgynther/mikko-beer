import { useState } from 'react'

import type { SearchIf } from '../../core/search/types'
import type {
  ListStylesIf,
  Style
} from '../../core/style/types'

import LoadingIndicator from '../common/LoadingIndicator'

import SearchStyle from './SearchStyle'

import '../common/SelectedItem.css'

export interface Props {
  listStylesIf: ListStylesIf
  initialParents: Style[]
  searchIf: SearchIf
  select: (parents: string[]) => void
}

function StyleParents (props: Props): JSX.Element {
  const [parents, doSetParents] = useState<Style[]>(props.initialParents)

  function setParents (parents: Style[]): void {
    props.select(parents.map((parent) => parent.id))
    doSetParents(parents)
  }

  return (
    <div>
      <h6>Parents</h6>
      <SearchStyle
        listStylesIf={props.listStylesIf}
        searchIf={props.searchIf}
        select={(style) => {
          const newParents = [...parents]
          newParents.push(style)
          setParents(newParents)
        }}
      />
      <div>
        {parents.map((parent, index) => (
          <div key={parent.id} className='SelectedItem'>
            <div>{parent.name}</div>
            <button onClick={() => {
              const newParents = [...parents]
              newParents.splice(index, 1)
              setParents(newParents)
            }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div>
        <LoadingIndicator isLoading={false} />
      </div>
    </div>
  )
}

export default StyleParents
