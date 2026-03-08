import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import TableSkeleton from './TableSkeleton'

test('renders skeleton', () => {
  const { getAllByRole } = render(
    <table>
      <tbody>
        <TableSkeleton
          isLoading={true}
          rowCount={2}
          columnCount={2}
        />
      </tbody>
    </table>
  )
  const cells = getAllByRole('cell')
  expect(cells.length).toEqual(4)
})

test('renders null', () => {
  const { queryAllByRole } = render(
    <table>
      <tbody>
        <TableSkeleton
          isLoading={false}
          rowCount={2}
          columnCount={2}
        />
      </tbody>
    </table>
  )
  const rows = queryAllByRole('row')
  expect(rows.length).toEqual(0)
})
