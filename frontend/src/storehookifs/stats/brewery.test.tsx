import { expect, test } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import { infiniteScroll } from "../../components/util"
import type { NavigateIf } from "../../components/util";
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import statsHook from './stats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

import Button from '../../components/common/Button'
import type {
  BreweryStats,
  BreweryStatsQueryParams,
  YearMonth
} from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const getUseDebounce = function<T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

function BreweryStatsHelper(
  props: { queryParams: BreweryStatsQueryParams }
): React.JSX.Element {
  const navigateIf: NavigateIf = {
    useNavigate: () => () => undefined
  }
  const statsIf = statsHook(
    infiniteScroll,
    navigateIf,
    minTime,
    maxTime,
    getUseDebounce
  )
  const { query, stats } = statsIf.brewery.useStats()
  return (
    <div>
      {stats?.brewery.map(brewery =>
        <div key={brewery.breweryId}>
          <div>{brewery.breweryName}</div>
          <div>{brewery.reviewAverage}</div>
          <div>{brewery.reviewCount}</div>
          <div>{brewery.reviewedBeerCount}</div>
        </div>
      )}
      <Button
        onClick={() => {
          void query(props.queryParams)
        }}
        text='Load'
      />
    </div>
  )
}

test('brewery stats', async () => {
  const user = userEvent.setup()

  const expectedResponse: BreweryStats = {
    brewery: [
      {
        breweryId: '4f951cc6-1ce2-4fca-94a8-79369c278005',
        breweryName: 'Koskipanimo',
        reviewAverage: '9.08',
        reviewCount: '77',
        reviewedBeerCount: '72'
      },
      {
        breweryId: 'f78d663c-7ed2-4109-9070-5133887ee0d8',
        breweryName: 'Mallassepät',
        reviewAverage: '9.23',
        reviewCount: '61',
        reviewedBeerCount: '60'
      }
    ]
  }

  const queryParams: BreweryStatsQueryParams = {
    breweryId: undefined,
    locationId: undefined,
    styleId: undefined,
    pagination: { skip: 0, size: 10 },
    sorting: {
      order: 'average',
      direction: 'asc'
    },
    minReviewCount: 40,
    maxReviewCount: 80,
    minReviewAverage: 9.00,
    maxReviewAverage: 9.30,
    timeStart: testTimes.min.utcTimestamp,
    timeEnd: testTimes.max.utcTimestamp
  }

  addTestServerResponse<BreweryStats>({
    method: 'GET',
    pathname: `/api/v1/stats/brewery?size=${
      queryParams.pagination.size
    }&skip=${
      queryParams.pagination.skip
    }&order=${
      queryParams.sorting.order
    }&direction=${
      queryParams.sorting.direction
    }&min_review_count=${
      queryParams.minReviewCount
    }&max_review_count=${
      queryParams.maxReviewCount
    }&min_review_average=${
      queryParams.minReviewAverage
    }&max_review_average=${
      queryParams.maxReviewAverage
    }&time_start=${
      queryParams.timeStart
    }&time_end=${
      queryParams.timeEnd
    }`,
    response: expectedResponse,
    status: 200
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <BreweryStatsHelper queryParams={queryParams} />
    </Provider>
  )
  const loadButton = getByRole('button', { name: 'Load' })
  await user.click(loadButton)
  const koskipanimo = expectedResponse.brewery[0]
  const mallassepat = expectedResponse.brewery[1]
  await waitFor(() => {
    expect(getByText(koskipanimo.breweryName)).toBeDefined()
    expect(getByText(koskipanimo.reviewAverage)).toBeDefined()
    expect(getByText(koskipanimo.reviewCount)).toBeDefined()
    expect(getByText(koskipanimo.reviewedBeerCount)).toBeDefined()
    expect(getByText(mallassepat.breweryName)).toBeDefined()
    expect(getByText(mallassepat.reviewAverage)).toBeDefined()
    expect(getByText(mallassepat.reviewCount)).toBeDefined()
    expect(getByText(mallassepat.reviewedBeerCount)).toBeDefined()
  })
})
