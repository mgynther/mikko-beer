import React from 'react'

import './LinkLikeButton.css'

interface Props {
  onClick: () => undefined
  text: string
}

function LinkLikeButton (props: Props): React.JSX.Element {
  return (
    <button
      type='button'
      className='linklike-button'
      onClick={() => { props.onClick(); }}
    >
      {props.text}
    </button>
  )
}

export default LinkLikeButton
