import React, { useState } from 'react'

import type { Brewery } from '../../types/brewery/types'

export const countryPlaceholder = 'Country code'

const countryPattern = /^[A-Z]{2}$/

interface Props {
  brewery: Brewery
  placeholder: string
  onChange: (brewery: Brewery | undefined) => void
}

function BreweryEditor(props: Props): React.JSX.Element {
  const [name, setName] = useState(props.brewery.name)
  const [country, setCountry] = useState(props.brewery.country ?? '')

  function onChange(newName: string, newCountry: string): void {
    const isCountryValid = newCountry === '' || countryPattern.test(newCountry)
    if (newName === '' || !isCountryValid) {
      props.onChange(undefined)
      return
    }
    props.onChange({
      ...props.brewery,
      name: newName,
      country: newCountry === '' ? undefined : newCountry,
    })
  }

  return (
    <div>
      <input
        type='text'
        placeholder={props.placeholder}
        value={name}
        onChange={(e) => {
          const fullNewName = e.target.value.trimStart()
          setName(fullNewName)
          onChange(fullNewName.trim(), country)
        }}
      />
      <input
        type='text'
        placeholder={countryPlaceholder}
        maxLength={2}
        value={country}
        onChange={(e) => {
          const newCountry = e.target.value.trim().toUpperCase()
          setCountry(newCountry)
          onChange(name.trim(), newCountry)
        }}
      />
    </div>
  )
}

export default BreweryEditor
