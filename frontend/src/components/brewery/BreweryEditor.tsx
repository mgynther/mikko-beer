import React, { useState } from 'react'

import type { Brewery } from '../../core/brewery/types'

interface Props {
  brewery: Brewery
  placeholder: string
  onChange: (brewery: Brewery | undefined) => void
}

function BreweryEditor (props: Props): React.JSX.Element {
  const [name, setName] = useState(props.brewery.name)
  return (
    <div>
      <input
        type='text'
        placeholder={props.placeholder}
        value={name}
        onChange={e => {
          const fullNewName = e.target.value.trimStart()
          setName(fullNewName)
          const newName = fullNewName.trim()
          if (newName === '') {
            props.onChange(undefined)
            return
          }
          props.onChange({
            ...props.brewery,
            name: newName
          })
        }}
      />
    </div>
  )
}

export default BreweryEditor
