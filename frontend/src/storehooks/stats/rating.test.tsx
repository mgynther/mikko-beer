import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import statsHook from './stats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

import type { IdParams, RatingStats } from '../../types/stats/types'

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

function RatingStatsHelper(props: { params: IdParams }): React.JSX.Element {
  const statsIf = statsHook()
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

  server?.addResponse<RatingStats>({
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
