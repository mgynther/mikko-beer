import { expect, test } from 'vitest'
import { infiniteScroll } from '../../components/util'
import type { NavigateIf } from '../../components/util'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import statsHook from './stats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

import type { AnnualStats, IdParams, YearMonth } from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const minTime: YearMonth = { year: 2017, month: 12 }
const maxTime: YearMonth = { year: 2024, month: 12 }

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

function AnnualStatsHelper(props: { params: IdParams }): React.JSX.Element {
  const navigateIf: NavigateIf = {
    useNavigate: () => () => undefined,
  }
  const statsIf = statsHook(
    infiniteScroll,
    navigateIf,
    minTime,
    maxTime,
    getUseDebounce,
  )
  const { stats } = statsIf.annual.useStats(props.params)
  return (
    <div>
      {stats?.annual.map((annual) => (
        <div key={annual.year}>
          <div>{annual.year}</div>
          <div>{annual.reviewAverage}</div>
          <div>{annual.reviewCount}</div>
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
