import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type {
  Brewery,
  SelectBreweryIf
} from '../../core/brewery/types'
import type { SearchIf } from '../../core/search/types'

import SelectBrewery from './SelectBrewery'

import '../common/SelectedItem.css'

import './SelectBreweries.css'

export interface Props {
  searchIf: SearchIf
  selectBreweryIf: SelectBreweryIf
  initialBreweries: Brewery[]
  select: (breweries: string[]) => void
}

interface BrewerySelection {
  id: string
  brewery: Brewery | undefined
}

interface SelectionItemProps {
  searchIf: SearchIf
  selectBreweryIf: SelectBreweryIf
  brewery: Brewery | undefined
  select: (brewery: Brewery) => void
  isRemoveVisible: boolean
  remove: () => void
  clear: () => void
}

function SelectionItem (props: SelectionItemProps): React.JSX.Element {
  return (
    <>
      {props.brewery === undefined && (
        <SelectBrewery
          searchIf={props.searchIf}
          selectBreweryIf={props.selectBreweryIf}
          select={props.select}
          isRemoveVisible={props.isRemoveVisible}
          remove={props.remove}
        />
      )}
      {props.brewery !== undefined && (
        <div className='SelectedItem'>
          <div>{props.brewery.name}</div>
          <button onClick={props.clear}>Change</button>
        </div>
      )}
    </>
  )
}

function SelectBreweries (props: Props): React.JSX.Element {
  function getInitialBrewerySelections (): BrewerySelection[] {
    if (props.initialBreweries.length === 0) {
      return [
        {
          brewery: undefined,
          id: uuidv4()
        }
      ]
    }
    return props.initialBreweries.map(brewery => ({
        id: brewery.id,
        brewery
      }))
  }
  const [selections, doSetSelections] = useState<BrewerySelection[]>(
    getInitialBrewerySelections()
  )

  function setSelections (selections: BrewerySelection[]): void {
    props.select([])
    doSetSelections(selections)
    if (hasUndefinedBrewery(selections)) return
    const breweries = selections
      .map(selections => selections.brewery)
      .filter(brewery => brewery !== undefined)
    const breweryIds = breweries.map(brewery => brewery.id)
    props.select(breweryIds)
  }

  function hasUndefinedBrewery (selections: BrewerySelection[]): boolean {
    return selections.reduce(
      (hasUndefined, selection: BrewerySelection) =>
        hasUndefined || selection.brewery === undefined
      , false)
  }

  return (
    <div>
      <h5>Breweries</h5>
      {selections.map((selection, selectionIndex) => (
        <SelectionItem
          key={selection.id}
          searchIf={props.searchIf}
          selectBreweryIf={props.selectBreweryIf}
          brewery={selection.brewery}
          select={(brewery) => {
            const newBreweries = [...selections]
            newBreweries[selectionIndex].brewery = brewery
            setSelections(newBreweries)
          }}
          isRemoveVisible={selections.length > 1}
          remove={() => {
            const newBreweries = [...selections]
            newBreweries.splice(selectionIndex, 1)
            setSelections(newBreweries)
          }}
          clear={() => {
            const newBreweries = [...selections]
            newBreweries[selectionIndex].brewery = undefined
            setSelections(newBreweries)
          }}
        />
      ))}
      {!hasUndefinedBrewery(selections) && (
        <div className='AddBrewery'>
          <button
            onClick={() => {
              const newBreweries = [
                ...selections,
                {
                  brewery: undefined,
                  id: uuidv4()
                }
              ]
              setSelections(newBreweries)
            }}
          >
            Add brewery
          </button>
        </div>
      )}
    </div>
  )
}

export default SelectBreweries
