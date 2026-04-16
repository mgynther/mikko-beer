import './TableSkeleton.css'

interface Props {
  isLoading: boolean
  rowCount: number
  columnCount: number
}

function TableSkeleton(props: Props): React.JSX.Element | null {
  if (!props.isLoading) {
    return null
  }
  const rowArray = Array.from(Array(props.rowCount).keys())
  const columnArray = Array.from(Array(props.columnCount).keys())
  return (
    <>
      {rowArray.map((_, rowIndex) => (
        <tr className='row' key={`skeleton-row-${rowIndex}`}>
          {columnArray.map((_, cellIndex) => (
            <td
              className='cell'
              key={`skeleton-row-${rowIndex}-cell-${cellIndex}`}
            >
              &nbsp;
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default TableSkeleton
