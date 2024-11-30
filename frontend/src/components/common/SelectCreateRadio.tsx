import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export enum Mode {
  SELECT = 'SELECT',
  CREATE = 'CREATE'
}

export interface Props {
  defaultMode: Mode
  createElement: React.JSX.Element
  selectElement: React.JSX.Element
}

interface BasicProps {
  mode: Mode
  onChange: (mode: Mode) => void
}

export function SelectCreateRadioBasic (props: BasicProps): React.JSX.Element {
  const [id] = useState(uuidv4())

  function onRadioChange (e: React.ChangeEvent<HTMLInputElement>): void {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison --
     * Type is lost in the radio button input.
     */
    const newMode = e.target.value === Mode.SELECT ? Mode.SELECT : Mode.CREATE
    props.onChange(newMode)
  }

  const modes = [
    {
      name: 'Create',
      value: Mode.CREATE
    },
    {
      name: 'Select',
      value: Mode.SELECT
    }
  ]

  return (
    <div>
      {modes.map(modeOption => (
        <label key={modeOption.value}>
          <input
            type="radio"
            name={`mode_${id}`}
            value={modeOption.value}
            onChange={onRadioChange}
            checked={modeOption.value === props.mode}
          />
          {modeOption.name}
        </label>
      ))}
    </div>
  )
}

function SelectCreateRadio (props: Props): React.JSX.Element {
  const [mode, setMode] = useState(props.defaultMode)

  return (
    <span>
      <SelectCreateRadioBasic
        mode={mode}
        onChange={(mode: Mode) => { setMode(mode) }}
      />

      {mode === Mode.SELECT && (
        <span>{props.selectElement}</span>
      )}
      {mode === Mode.CREATE && (
        <span>{props.createElement}</span>
      )}
    </span>
  )
}

export default SelectCreateRadio
