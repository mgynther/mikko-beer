import LoadingIndicator from './LoadingIndicator'

import './EditActions.css'

interface Props {
  isSaveDisabled: boolean
  isSaving: boolean
  onCancel: () => void
  onSave: () => void
}

function EditActions (props: Props): JSX.Element | null {
  return (
    <span className='EditActions'>
      <button onClick={() => { props.onCancel() }}>Cancel</button>
      <button
        disabled={props.isSaveDisabled || props.isSaving}
        onClick={() => { props.onSave() }}
      >
        Save
      </button>
      <LoadingIndicator isLoading={props.isSaving} />
    </span>
  )
}

export default EditActions
