import React, { useState } from 'react'

import type { Container } from '../../core/container/types'
import { isSizeValid } from './util'

interface Props {
  initialContainer: Container
  onChange: (container: Container | undefined) => void
}

function ContainerEditor (props: Props): React.JSX.Element {
  const [container, setContainer] = useState(props.initialContainer)

  function onChange (type: string, size: string): void {
    const newContainer = {
      ...container,
      type,
      size
    }
    setContainer(newContainer)
    if (newContainer.type.length > 0 && isSizeValid(newContainer.size)) {
      props.onChange(newContainer)
      return
    }
    props.onChange(undefined)
  }

  return (
    <>
      <input
        type='text'
        placeholder='Type'
        value={container.type}
        onChange={e => {
          onChange(e.target.value, container.size)
        }}
      />
      <input
        type='text'
        placeholder='Size, for example 0.25'
        value={container.size}
        onChange={e => {
          onChange(container.type, e.target.value)
        }}
      />
    </>
  )
}

export default ContainerEditor
