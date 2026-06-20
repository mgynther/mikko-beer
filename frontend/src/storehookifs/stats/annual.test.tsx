import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import statsHook from './stats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

import type { AnnualStats, IdParams } from '../../core/stats/types'

function AnnualStatsHelper(props: { params: IdParams }): React.JSX.Element {
  const statsIf = statsHook()
  const { stats } = statsIf.annual.useStats(props.params)
  return (
    <div>
      {stats?.annual.map((annual) => (
        <div key={annual.year}>
          <div>{annual.year}</div>
          <div>{annual.reviewAverage}</div>
          <div>{annual.reviewCount}</div>
          <div>{annual.reviewMedian}</div>
          <div>{annual.reviewMode}</div>
          <div>{annual.reviewStandardDeviation}</div>
        </div>
      ))}
    </div>
  )
}

test('annual stats', async () => {
  const expectedResponse: AnnualStats = {
    annual: [
      {
        reviewAverage: '8.45',
        reviewCount: '132',
        reviewMedian: '8.00',
        reviewMode: '8',
        reviewStandardDeviation: '0.84',
        year: '2023',
      },
    ],
  }

  const params: IdParams = {
    breweryId: '9f25a740-1e7f-454b-b067-57a941795ca9',
    locationId: undefined,
    styleId: undefined,
  }

  addTestServerResponse<AnnualStats>({
    method: 'GET',
    pathname: `/api/v1/stats/annual?brewery=${params.breweryId}`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <Provider store={store}>
      <AnnualStatsHelper params={params} />
    </Provider>,
  )
  const annual = expectedResponse.annual[0]
  await waitFor(() => {
    expect(getByText(annual.year)).toBeDefined()
  })
  expect(getByText(annual.reviewAverage)).toBeDefined()
  expect(getByText(annual.reviewCount)).toBeDefined()
})
