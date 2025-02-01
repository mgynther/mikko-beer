import React, { useState } from 'react'

import type { Location } from '../../core/location/types'

interface Props {
  location: Location
  placeholder: string
  onChange: (location: Location | undefined) => void
}

function LocationEditor (props: Props): React.JSX.Element {
  const [name, setName] = useState(props.location.name)
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
            ...props.location,
            name: newName
          })
        }}
      />
    </div>
  )
}

export default LocationEditor
