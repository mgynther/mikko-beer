import { expect, test } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import { infiniteScroll } from '../../components/util'
import type { NavigateIf } from '../../components/util'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import statsHook from './stats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

import Button from '../../components/common/Button'
import type {
  LocationStats,
  LocationStatsQueryParams,
  YearMonth,
} from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

function LocationStatsHelper(props: {
  queryParams: LocationStatsQueryParams
}): React.JSX.Element {
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
  const { query, stats } = statsIf.location.useStats()
  return (
    <div>
      {stats?.location.map((location) => (
        <div key={location.locationId}>
          <div>{location.locationName}</div>
          <div>{location.reviewAverage}</div>
          <div>{location.reviewCount}</div>
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

test('location stats', async () => {
  const user = userEvent.setup()

  const expectedResponse: LocationStats = {
    location: [
      {
        locationId: '6d586d9d-e87c-43f2-87d3-abe5ecb63c08',
        locationName: 'Kuja Beer Shop & Bar',
        reviewAverage: '9.25',
        reviewCount: '202',
        reviewMedian: '9.50',
        reviewMode: '10',
        reviewStandardDeviation: '0.75',
      },
      {
        locationId: '616e52b4-78c2-4a60-8a11-173c97632294',
        locationName: 'Oluthuone Panimomestari',
        reviewAverage: '9.05',
        reviewCount: '35',
        reviewMedian: '9.00',
        reviewMode: '9',
        reviewStandardDeviation: '0.68',
      },
    ],
  }

  const queryParams: LocationStatsQueryParams = {
    breweryId: undefined,
    locationId: undefined,
    styleId: undefined,
    pagination: { skip: 0, size: 10 },
    sorting: {
      order: 'count',
      direction: 'desc',
    },
    minReviewCount: 40,
    maxReviewCount: 80,
    minReviewAverage: 9.0,
    maxReviewAverage: 9.3,
    timeStart: testTimes.min.utcTimestamp,
    timeEnd: testTimes.max.utcTimestamp,
  }

  addTestServerResponse<LocationStats>({
    method: 'GET',
    pathname: `/api/v1/stats/location?size=${
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
      <LocationStatsHelper queryParams={queryParams} />
    </Provider>,
  )
  const loadButton = getByRole('button', { name: 'Load' })
  await user.click(loadButton)
  const kuja = expectedResponse.location[0]
  const oluthuone = expectedResponse.location[1]
  await waitFor(() => {
    expect(getByText(kuja.locationName)).toBeDefined()
    expect(getByText(kuja.reviewAverage)).toBeDefined()
    expect(getByText(kuja.reviewCount)).toBeDefined()
    expect(getByText(oluthuone.locationName)).toBeDefined()
    expect(getByText(oluthuone.reviewAverage)).toBeDefined()
    expect(getByText(oluthuone.reviewCount)).toBeDefined()
  })
})
