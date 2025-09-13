import React from 'react'

import Button from './Button'
import LoadingIndicator from './LoadingIndicator'

import './EditActions.css'

interface Props {
  isSaveDisabled: boolean
  isSaving: boolean
  onCancel: () => void
  onSave: () => void
}

function EditActions (props: Props): React.JSX.Element | null {
  return (
    <span className='EditActions'>
      <Button onClick={() => { props.onCancel() }} text='Cancel' />
      <Button
        disabled={props.isSaveDisabled || props.isSaving}
        onClick={() => { props.onSave() }}
        text='Save'
      />
      <LoadingIndicator isLoading={props.isSaving} />
    </span>
  )
}

export default EditActions
