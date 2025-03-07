import React from 'react'

import './TabButton.css'

interface TabButtonProps {
  isCompact: boolean
  isSelected: boolean
  onClick: () => void
  title: string
}

function TabButton (props: TabButtonProps): React.JSX.Element {
  const selectedClass = props.isSelected ? 'Selected' : ''
  const compactClass = props.isCompact ? 'Compact' : ''
  const className =
    `TabButton ${selectedClass} ${compactClass}`.trim()
  return (
    <button
      className={className}
      onClick={props.onClick}>
      {props.title}
    </button>
  )
}

export default TabButton
