import { expect, test } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import { infiniteScroll } from '../../components/util'
import type { NavigateIf } from '../../components/util'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import statsHook from './stats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

import type {
  StyleStats,
  StyleStatsQueryParams,
  YearMonth,
} from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

function StyleStatsHelper(props: {
  queryParams: StyleStatsQueryParams
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
  const { stats } = statsIf.style.useStats(props.queryParams)
  return (
    <div>
      {stats?.style.map((style) => (
        <div key={style.styleId}>
          <div>{style.styleName}</div>
          <div>{style.reviewAverage}</div>
          <div>{style.reviewCount}</div>
        </div>
      ))}
    </div>
  )
}

test('style stats', async () => {
  const expectedResponse: StyleStats = {
    style: [
      {
        styleId: '0eac21cc-9401-474f-b22f-8c7d535b712f',
        styleName: 'IPA',
        reviewAverage: '9.18',
        reviewCount: '302',
      },
      {
        styleId: '69aca5b4-4bfd-45bd-b68d-006f4b725c2b',
        styleName: 'Pils',
        reviewAverage: '9.03',
        reviewCount: '199',
      },
    ],
  }

  const queryParams: StyleStatsQueryParams = {
    breweryId: undefined,
    locationId: undefined,
    styleId: undefined,
    sorting: {
      order: 'count',
      direction: 'desc',
    },
    minReviewCount: 40,
    maxReviewCount: Infinity,
    minReviewAverage: 9.0,
    maxReviewAverage: 9.3,
    timeStart: testTimes.min.utcTimestamp,
    timeEnd: testTimes.max.utcTimestamp,
  }

  addTestServerResponse<StyleStats>({
    method: 'GET',
    pathname: `/api/v1/stats/style?order=${
      queryParams.sorting.order
    }&direction=${queryParams.sorting.direction}&min_review_count=${
      queryParams.minReviewCount
    }&min_review_average=${queryParams.minReviewAverage}&max_review_average=${
      queryParams.maxReviewAverage
    }&time_start=${queryParams.timeStart}&time_end=${queryParams.timeEnd}`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <Provider store={store}>
      <StyleStatsHelper queryParams={queryParams} />
    </Provider>,
  )
  const ipa = expectedResponse.style[0]
  const pils = expectedResponse.style[1]
  await waitFor(() => {
    expect(getByText(ipa.styleName)).toBeDefined()
    expect(getByText(ipa.reviewAverage)).toBeDefined()
    expect(getByText(ipa.reviewCount)).toBeDefined()
    expect(getByText(pils.styleName)).toBeDefined()
    expect(getByText(pils.reviewAverage)).toBeDefined()
    expect(getByText(pils.reviewCount)).toBeDefined()
  })
})
