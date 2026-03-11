import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import getAnnualStorageStats from './annualStats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import type { AnnualStats } from '../../core/storage/types'

function Helper(): React.JSX.Element {
  const statsIf = getAnnualStorageStats()
  const { stats } = statsIf.useAnnualStats()
  return (
    <table>
      <tbody>
        {stats?.annual.map(oneYear =>
          <tr key={oneYear.year}>
            <td>{oneYear.year}</td>
            <td>{oneYear.count}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

test('get annual stats', async () => {
  const expectedResponse: AnnualStats = {
    annual: [{
      year: '2024',
      count: '5'
    }]
  }
  addTestServerResponse<AnnualStats>({
    method: 'GET',
    pathname: `/api/v1/storage/annual-stats`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.annual[0].year)).toBeDefined()
    expect(getByText(expectedResponse.annual[0].count)).toBeDefined()
  })
})
