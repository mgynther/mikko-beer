import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import getAnnualStorageStats from './annualStats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import type { AnnualStats } from '../../types/storage/types'

let server: TestServer | undefined

beforeAll(() => {
  server = createServer()
})

beforeEach(() => {
  server?.clear()
})

afterAll(() => {
  server?.close()
})

function Helper(): React.JSX.Element {
  const statsIf = getAnnualStorageStats()
  const { stats } = statsIf.useAnnualStats()
  return (
    <table>
      <tbody>
        {stats?.annual.map((oneYear) => (
          <tr key={oneYear.year}>
            <td>{oneYear.year}</td>
            <td>{oneYear.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

test('get annual stats', async () => {
  const expectedResponse: AnnualStats = {
    annual: [
      {
        year: '2024',
        count: '5',
      },
    ],
  }
  server?.addResponse<AnnualStats>({
    method: 'GET',
    pathname: `/api/v1/storage/annual-stats`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>,
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.annual[0].year)).toBeDefined()
    expect(getByText(expectedResponse.annual[0].count)).toBeDefined()
  })
})
