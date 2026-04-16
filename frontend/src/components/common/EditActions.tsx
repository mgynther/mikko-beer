import React from 'react'

import Button from './Button'
import LoadingIndicator from './LoadingIndicator'

import './EditActions.css'

interface Props {
  isSaveDisabled: boolean
  isSaving: boolean
  onCancel: () => void
  // Explicit undefined supported to enable missing callback when there's
  // nothing that could be saved.
  onSave: (() => void) | undefined
}

function EditActions(props: Props): React.JSX.Element | null {
  return (
    <span className='EditActions'>
      <Button
        onClick={() => {
          props.onCancel()
        }}
        text='Cancel'
      />
      <Button
        disabled={
          props.isSaveDisabled || props.isSaving || props.onSave === undefined
        }
        onClick={() => {
          props.onSave?.()
        }}
        text='Save'
      />
      <LoadingIndicator isLoading={props.isSaving} />
    </span>
  )
}

export default EditActions
