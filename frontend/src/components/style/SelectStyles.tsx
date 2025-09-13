import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { SearchIf } from '../../core/search/types'
import type {
  SelectStyleIf,
  Style
} from '../../core/style/types'

import Button from '../common/Button'
import SelectStyle from './SelectStyle'

import '../common/SelectedItem.css'

import './SelectStyles.css'

export interface Props {
  searchIf: SearchIf
  selectStyleIf: SelectStyleIf
  initialStyles: Style[]
  select: (styles: string[]) => void
}

interface StyleSelection {
  id: string
  style: Style | undefined
}

interface SelectionItemProps {
  searchIf: SearchIf
  selectStyleIf: SelectStyleIf
  style: Style | undefined
  select: (style: Style) => void
  remove: () => void
  clear: () => void
}

function SelectionItem (props: SelectionItemProps): React.JSX.Element {
  return (
    <>
      {props.style === undefined && (
        <SelectStyle
          searchIf={props.searchIf}
          selectStyleIf={props.selectStyleIf}
          select={props.select}
          remove={props.remove}
        />
      )}
      {props.style !== undefined && (
        <div className='SelectedItem'>
          <div>{props.style.name}</div>
          <Button onClick={props.clear} text='Change' />
        </div>
      )}
    </>
  )
}

function SelectStyles (props: Props): React.JSX.Element {
  function getInitialStyleSelections (): StyleSelection[] {
    if (props.initialStyles.length === 0) {
      return [
        {
          style: undefined,
          id: uuidv4()
        }
      ]
    }
    return props.initialStyles.map(style => ({
        id: style.id,
        style
      }))
  }
  const [selections, doSetSelections] = useState<StyleSelection[]>(
    getInitialStyleSelections()
  )

  function setSelections (selections: StyleSelection[]): void {
    props.select([])
    doSetSelections(selections)
    if (hasUndefinedStyle(selections)) return
    const styles = selections
      .map(selections => selections.style)
      .filter(style => style !== undefined)
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
          searchIf={props.searchIf}
          selectStyleIf={props.selectStyleIf}
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
          <Button
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
            text='Add style'
          />
        </div>
      )}
    </div>
  )
}

export default SelectStyles
