import { useState } from 'react'

import { type Style } from '../../store/style/types'

import LoadingIndicator from '../LoadingIndicator'

import SearchStyle from './SearchStyle'

import '../SelectedItem.css'

export interface Props {
  select: (parents: string[]) => void
}

function StyleParents (props: Props): JSX.Element {
  const [parents, doSetParents] = useState<Style[]>([])

  function setParents (parents: Style[]): void {
    props.select(parents.map((parent) => parent.id))
    doSetParents(parents)
  }

  return (
    <div>
      <h6>Parents</h6>
      <SearchStyle select={(style) => {
        const newParents = [...parents]
        newParents.push(style)
        setParents(newParents)
      }} />
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
