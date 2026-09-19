import TabButton from './TabButton'

import './OpenFiltersButton.css'

interface Props {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

function OpenFiltersButton(props: Props): React.JSX.Element {
  const { isOpen } = props
  function getOpenSymbol(isOpen: boolean): string {
    return isOpen ? '▲' : '▼'
  }
  return (
    <div className='Toggle'>
      <TabButton
        isCompact={true}
        isSelected={false}
        isUpperCase={false}
        onClick={() => {
          props.setIsOpen(!isOpen)
        }}
        title={`Filters ${getOpenSymbol(isOpen)}`}
      />
    </div>
  )
}

export default OpenFiltersButton
