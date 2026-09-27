import { test } from '../../../test'
import { assertEqual } from '../../../assert'
import { render } from '../../../render'
import TableSkeleton from '../../../../src/components/internal/common/TableSkeleton'

test('renders skeleton', () => {
  const { getAllByRole } = render(
    <table>
      <tbody>
        <TableSkeleton isLoading={true} rowCount={2} columnCount={2} />
      </tbody>
    </table>,
  )
  const cells = getAllByRole('cell')
  assertEqual(cells.length, 4)
})

test('renders null', () => {
  const { queryAllByRole } = render(
    <table>
      <tbody>
        <TableSkeleton isLoading={false} rowCount={2} columnCount={2} />
      </tbody>
    </table>,
  )
  const rows = queryAllByRole('row')
  assertEqual(rows.length, 0)
})
