import { Fragment, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { type Style } from '../store/style/types'

import SelectStyle from './SelectStyle'

import './BeerStyles.css'
import './SelectedItem.css'

export interface Props {
  select: (styles: string[]) => void
}

interface StyleSelection {
  id: string
  style: Style | undefined
}

interface SelectionItemProps {
  style: Style | undefined
  select: (style: Style) => void
  remove: () => void
  clear: () => void
}

function SelectionItem (props: SelectionItemProps): JSX.Element {
  return (
    <Fragment>
      {props.style === undefined && (
        <SelectStyle
          select={props.select}
          remove={props.remove}
        />
      )}
      {props.style !== undefined && (
        <div className='SelectedItem'>
          <div>{props.style.name}</div>
          <button onClick={props.clear}>Change</button>
        </div>
      )}
    </Fragment>
  )
}

function BeerStyles (props: Props): JSX.Element {
  const [selections, doSetSelections] = useState<StyleSelection[]>(
    [
      {
        style: undefined,
        id: uuidv4()
      }
    ]
  )

  function setSelections (selections: StyleSelection[]): void {
    props.select([])
    doSetSelections(selections)
    if (hasUndefinedStyle(selections)) return
    const styles = selections
      .map(selections => selections.style)
      .filter(style => style) as Style[]
    const styleIds = styles.map(style => style.id)
    props.select(styleIds)
  }

  function hasUndefinedStyle (selections: StyleSelection[]): boolean {
    return selections.reduce(
      (hasUndefined, selection: StyleSelection) =>
        hasUndefined || selection.style === undefined
      , false)
  }
  return (
    <div>
      <h5>Styles</h5>
      {selections.map((selection, selectionIndex) => (
        <SelectionItem
          key={selection.id}
          style={selection.style}
          select={(style) => {
            const newStyles = [...selections]
            newStyles[selectionIndex].style = style
            setSelections(newStyles)
          }}
          remove={() => {
            const newStyles = [...selections]
            newStyles.splice(selectionIndex, 1)
            setSelections(newStyles)
          }}
          clear={() => {
            const newStyles = [...selections]
            newStyles[selectionIndex].style = undefined
            setSelections(newStyles)
          }}
        />
      ))}
      {!hasUndefinedStyle(selections) && (
        <div>
          <button
            onClick={() => {
              const newStyles = [
                ...selections,
                {
                  style: undefined,
                  id: uuidv4()
                }
              ]
              setSelections(newStyles)
            }}
          >
            Add style
          </button>
        </div>
      )}
    </div>
  )
}

export default BeerStyles
