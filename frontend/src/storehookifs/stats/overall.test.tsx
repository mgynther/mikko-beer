import { expect, test } from 'vitest'
import { infiniteScroll } from '../../components/util'
import type { NavigateIf } from '../../components/util'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import statsHook from './stats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

import type { IdParams, OverallStats, YearMonth } from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const minTime: YearMonth = { year: 2017, month: 12 }
const maxTime: YearMonth = { year: 2024, month: 12 }

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

function OverallStatsHelper(props: { params: IdParams }): React.JSX.Element {
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
  const { stats } = statsIf.overall.useStats(props.params)
  return (
    <div>
      {stats !== undefined && (
        <>
          <div>{stats.beerCount}</div>
          <div>{stats.breweryCount}</div>
          <div>{stats.containerCount}</div>
          <div>{stats.locationCount}</div>
          <div>{stats.distinctBeerReviewCount}</div>
          <div>{stats.reviewAverage}</div>
          <div>{stats.reviewCount}</div>
          <div>{stats.reviewMedian}</div>
          <div>{stats.reviewMode}</div>
          <div>{stats.reviewStandardDeviation}</div>
          <div>{stats.styleCount}</div>
        </>
      )}
    </div>
  )
}

test('overall stats', async () => {
  const overallStats: OverallStats = {
    beerCount: '482',
    breweryCount: '91',
    containerCount: '7',
    locationCount: '14',
    distinctBeerReviewCount: '401',
    reviewAverage: '8.25',
    reviewCount: '512',
    reviewMedian: '8.00',
    reviewMode: '8',
    reviewStandardDeviation: '0.86',
    styleCount: '33',
  }

  const params: IdParams = {
    breweryId: undefined,
    locationId: undefined,
    styleId: '1d922ad8-5dc2-46f7-b240-3c4168f9a36c',
  }

  addTestServerResponse<{ overall: OverallStats }>({
    method: 'GET',
    pathname: `/api/v1/stats/overall?style=${params.styleId}`,
    response: { overall: overallStats },
    status: 200,
  })

  const { getByText } = render(
    <Provider store={store}>
      <OverallStatsHelper params={params} />
    </Provider>,
  )
  await waitFor(() => {
    expect(getByText(overallStats.beerCount)).toBeDefined()
  })
  expect(getByText(overallStats.breweryCount)).toBeDefined()
  expect(getByText(overallStats.containerCount)).toBeDefined()
  expect(getByText(overallStats.locationCount)).toBeDefined()
  expect(getByText(overallStats.distinctBeerReviewCount)).toBeDefined()
  expect(getByText(overallStats.reviewAverage)).toBeDefined()
  expect(getByText(overallStats.reviewCount)).toBeDefined()
  expect(getByText(overallStats.reviewMedian)).toBeDefined()
  expect(getByText(overallStats.reviewMode)).toBeDefined()
  expect(getByText(overallStats.reviewStandardDeviation)).toBeDefined()
  expect(getByText(overallStats.styleCount)).toBeDefined()
})
