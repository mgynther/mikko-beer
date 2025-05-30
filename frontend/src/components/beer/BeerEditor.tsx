import React, { useState } from 'react'

import type {
  Beer,
  BeerWithIds,
  EditBeerIf
} from '../../core/beer/types'
import type { SearchIf } from '../../core/search/types'

import SelectBreweries from '../brewery/SelectBreweries'
import SelectStyles from '../style/SelectStyles'

interface Props {
  editBeerIf: EditBeerIf
  initialBeer: Beer | undefined
  onChange: (beer: BeerWithIds | undefined) => void
  searchIf: SearchIf
}

function BeerEditor (props: Props): React.JSX.Element {
  const [name, setName] = useState(props.initialBeer?.name ?? '')
  const [breweryIds, setBreweryIds] = useState<string[]>(
    props.initialBeer?.breweries.map(brewery => brewery.id) ?? []
  )
  const [styleIds, setStyleIds] = useState<string[]>(
    props.initialBeer?.styles.map(style => style.id) ?? []
  )

  function onChange (
    name: string,
    breweries: string[],
    styles: string[]): void {
    if (name === '' ||
      breweries.length === 0 ||
      styles.length === 0) {
      props.onChange(undefined)
      return
    }
    props.onChange({
      id: props.initialBeer?.id ?? '',
      name,
      breweries,
      styles
    })
  }

  return (
    <div>
      <div className={'Section'}>
        <input
          placeholder='Name'
          type="text"
          value={name}
          onChange={(e) => {
            const name = e.target.value
            setName(name)
            onChange(name, breweryIds, styleIds)
          }}
        />
      </div>
      <div className={'Section'}>
        <SelectBreweries
          searchIf={props.searchIf}
          selectBreweryIf={props.editBeerIf.selectBreweryIf}
          initialBreweries={props.initialBeer?.breweries ?? []}
          select={(breweryIds) => {
            setBreweryIds(breweryIds)
            onChange(name, breweryIds, styleIds)
          }}
        />
      </div>
      <div className={'Section'}>
        <SelectStyles
          searchIf={props.searchIf}
          selectStyleIf={props.editBeerIf.selectStyleIf}
          initialStyles={props.initialBeer?.styles ?? []}
          select={(styleIds) => {
            setStyleIds(styleIds)
            onChange(name, breweryIds, styleIds)
          }}
        />
      </div>
    </div>
  )
}

export default BeerEditor
