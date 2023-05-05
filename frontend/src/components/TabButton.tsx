import './TabButton.css'

interface TabButtonProps {
  isSelected: boolean
  onClick: () => void
  title: string
}

function TabButton (props: TabButtonProps): JSX.Element {
  const className =
    `TabButton ${props.isSelected ? 'Selected' : ''}`
  return (
    <button
      className={className}
      onClick={props.onClick}>
      {props.title}
    </button>
  )
}

export default TabButton
