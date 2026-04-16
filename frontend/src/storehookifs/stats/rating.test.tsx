import { expect, test } from 'vitest'
import { infiniteScroll } from '../../components/util'
import type { NavigateIf } from '../../components/util'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import statsHook from './stats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

import type { IdParams, RatingStats, YearMonth } from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const minTime: YearMonth = { year: 2017, month: 12 }
const maxTime: YearMonth = { year: 2024, month: 12 }

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

function RatingStatsHelper(props: { params: IdParams }): React.JSX.Element {
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
  const { stats } = statsIf.rating.useStats(props.params)
  return (
    <div>
      {stats?.rating.map((rating) => (
        <div key={rating.rating}>
          <div>{rating.rating}</div>
          <div>{rating.count}</div>
        </div>
      ))}
    </div>
  )
}

test('rating stats', async () => {
  const expectedResponse: RatingStats = {
    rating: [
      {
        rating: '10',
        count: '45',
      },
    ],
  }

  const params: IdParams = {
    breweryId: undefined,
    locationId: undefined,
    styleId: undefined,
  }

  addTestServerResponse<RatingStats>({
    method: 'GET',
    pathname: '/api/v1/stats/rating',
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <Provider store={store}>
      <RatingStatsHelper params={params} />
    </Provider>,
  )
  const rating = expectedResponse.rating[0]
  await waitFor(() => {
    expect(getByText(rating.rating)).toBeDefined()
  })
  expect(getByText(rating.count)).toBeDefined()
})
