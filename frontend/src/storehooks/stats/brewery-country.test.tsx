import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import statsHook from './stats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import { setupUser } from '../../../test-util/user-event'

import Button from '../../components/common/Button'
import type {
  BreweryCountryStats,
  BreweryCountryStatsQueryParams,
} from '../../types/stats/types'

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

function BreweryCountryStatsHelper(props: {
  queryParams: BreweryCountryStatsQueryParams
}): React.JSX.Element {
  const statsIf = statsHook()
  const { query, stats } = statsIf.breweryCountry.useStats()
  return (
    <div>
      {stats?.breweryCountry.map((breweryCountry) => (
        <div key={breweryCountry.countryCode}>
          <div>{breweryCountry.countryCode}</div>
          <div>{breweryCountry.breweryCount}</div>
          <div>{breweryCountry.reviewAverage}</div>
          <div>{breweryCountry.reviewCount}</div>
          <div>{breweryCountry.reviewMedian}</div>
          <div>{breweryCountry.reviewMode}</div>
          <div>{breweryCountry.reviewStandardDeviation}</div>
          <div>{breweryCountry.reviewedBeerCount}</div>
        </div>
      ))}
      <Button
        onClick={() => {
          void query(props.queryParams)
        }}
        text='Load'
      />
    </div>
  )
}

test('brewery country stats', async () => {
  const user = setupUser()

  const expectedResponse: BreweryCountryStats = {
    breweryCountry: [
      {
        countryCode: 'FI',
        breweryCount: '13',
        reviewAverage: '9.08',
        reviewCount: '77',
        reviewMedian: '9.00',
        reviewMode: '9',
        reviewStandardDeviation: '0.55',
        reviewedBeerCount: '72',
      },
      {
        countryCode: 'EE',
        breweryCount: '4',
        reviewAverage: '9.23',
        reviewCount: '61',
        reviewMedian: '9.50',
        reviewMode: '10',
        reviewStandardDeviation: '0.54',
        reviewedBeerCount: '60',
      },
    ],
  }

  const queryParams: BreweryCountryStatsQueryParams = {
    breweryId: undefined,
    locationId: undefined,
    styleId: undefined,
    pagination: { skip: 0, size: 10 },
    sorting: {
      order: 'average',
      direction: 'asc',
    },
    minReviewCount: 40,
    maxReviewCount: 80,
    minReviewAverage: 9.0,
    maxReviewAverage: 9.3,
    timeStart: testTimes.min.utcTimestamp,
    timeEnd: testTimes.max.utcTimestamp,
  }

  server?.addResponse<BreweryCountryStats>({
    method: 'GET',
    pathname: `/api/v1/stats/brewery_country?size=${
      queryParams.pagination.size
    }&skip=${queryParams.pagination.skip}&order=${
      queryParams.sorting.order
    }&direction=${queryParams.sorting.direction}&min_review_count=${
      queryParams.minReviewCount
    }&max_review_count=${queryParams.maxReviewCount}&min_review_average=${
      queryParams.minReviewAverage
    }&max_review_average=${queryParams.maxReviewAverage}&time_start=${
      queryParams.timeStart
    }&time_end=${queryParams.timeEnd}`,
    response: expectedResponse,
    status: 200,
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <BreweryCountryStatsHelper queryParams={queryParams} />
    </Provider>,
  )
  const loadButton = getByRole('button', { name: 'Load' })
  await user.click(loadButton)
  const finland = expectedResponse.breweryCountry[0]
  const estonia = expectedResponse.breweryCountry[1]
  await waitFor(() => {
    expect(getByText(finland.countryCode)).toBeDefined()
    expect(getByText(finland.breweryCount)).toBeDefined()
    expect(getByText(finland.reviewAverage)).toBeDefined()
    expect(getByText(finland.reviewCount)).toBeDefined()
    expect(getByText(finland.reviewMedian)).toBeDefined()
    expect(getByText(finland.reviewMode)).toBeDefined()
    expect(getByText(finland.reviewStandardDeviation)).toBeDefined()
    expect(getByText(finland.reviewedBeerCount)).toBeDefined()
    expect(getByText(estonia.countryCode)).toBeDefined()
    expect(getByText(estonia.breweryCount)).toBeDefined()
    expect(getByText(estonia.reviewAverage)).toBeDefined()
    expect(getByText(estonia.reviewCount)).toBeDefined()
    expect(getByText(estonia.reviewMedian)).toBeDefined()
    expect(getByText(estonia.reviewMode)).toBeDefined()
    expect(getByText(estonia.reviewStandardDeviation)).toBeDefined()
    expect(getByText(estonia.reviewedBeerCount)).toBeDefined()
  })
})
