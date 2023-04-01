import { Fragment, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { type Brewery } from '../store/brewery/types'

import SelectBrewery from './SelectBrewery'

export interface Props {
  select: (breweries: string[]) => void
}

interface BrewerySelection {
  id: string
  brewery: Brewery | undefined
}

interface SelectionItemProps {
  brewery: Brewery | undefined
  select: (brewery: Brewery) => void
  remove: () => void
  clear: () => void
}

function SelectionItem (props: SelectionItemProps): JSX.Element {
  return (
    <Fragment>
      {props.brewery === undefined && (
        <SelectBrewery
          select={props.select}
          remove={props.remove}
        />
      )}
      {props.brewery !== undefined && (
        <div>
          Selected brewery: {props.brewery.name}
          <button onClick={props.clear}>Clear</button>
        </div>
      )}
    </Fragment>
  )
}

function BeerBreweries (props: Props): JSX.Element {
  const [selections, doSetSelections] = useState<BrewerySelection[]>(
    [
      {
        brewery: undefined,
        id: uuidv4()
      }
    ]
  )

  function setSelections (selections: BrewerySelection[]): void {
    props.select([])
    doSetSelections(selections)
    if (hasUndefinedBrewery(selections)) return
    const breweries = selections
      .map(selections => selections.brewery)
      .filter(brewery => brewery) as Brewery[]
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
          brewery={selection.brewery}
          select={(brewery) => {
            const newBreweries = [...selections]
            newBreweries[selectionIndex].brewery = brewery
            setSelections(newBreweries)
          }}
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
      <div>
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
    </div>
  )
}

export default BeerBreweries