import './FilterControls.css'

interface Props {
  children: React.ReactNode
}

function FilterControls(props: Props): React.JSX.Element {
  return <div className='FilterControls'>{props.children}</div>
}

export default FilterControls
