import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import getMonthlyStorageStats from './monthlyStats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import type { MonthlyStats } from '../../core/storage/types'

function Helper(): React.JSX.Element {
  const statsIf = getMonthlyStorageStats()
  const { stats } = statsIf.useMonthlyStats()
  return (
    <table>
      <tbody>
        {stats?.monthly.map(oneYear =>
          <tr key={oneYear.year}>
            <td>{oneYear.year}</td>
            <td>{oneYear.count}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

test('get monthly stats', async () => {
  const expectedResponse: MonthlyStats = {
    monthly: [{
      year: '2024',
      month: '8',
      count: '5'
    }]
  }
  addTestServerResponse<MonthlyStats>({
    method: 'GET',
    pathname: `/api/v1/storage/monthly-stats`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.monthly[0].year)).toBeDefined()
    expect(getByText(expectedResponse.monthly[0].count)).toBeDefined()
  })
})
