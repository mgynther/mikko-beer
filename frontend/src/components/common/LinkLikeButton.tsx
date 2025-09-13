import React from 'react'

import Button from './Button'

import './LinkLikeButton.css'

interface Props {
  onClick: () => undefined
  text: string
}

function LinkLikeButton (props: Props): React.JSX.Element {
  return (
    <Button
      className='linklike-button'
      onClick={() => { props.onClick(); }}
      text={props.text}
    />
  )
}

export default LinkLikeButton
