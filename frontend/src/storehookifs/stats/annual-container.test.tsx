import { expect, test } from 'vitest'
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
  AnnualContainerStats,
  AnnualContainerStatsQueryParams,
  YearMonth
} from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const minTime: YearMonth = { year: 2017, month: 12 }
const maxTime: YearMonth = { year: 2024, month: 12 }

const getUseDebounce = function<T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

function AnnualContainerStatsHelper(
  props: {
    queryParams: AnnualContainerStatsQueryParams
  }
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
  const { query, stats } =
    statsIf.annualContainer.useStats()
  return (
    <div>
      {stats?.annualContainer.map(ac =>
        <div key={`${ac.containerId}-${ac.year}`}>
          <div>{ac.containerType}</div>
          <div>{ac.containerSize}</div>
          <div>{ac.reviewAverage}</div>
          <div>{ac.reviewCount}</div>
          <div>{ac.year}</div>
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

test('annual container stats', async () => {
  const user = userEvent.setup()

  const expectedResponse: AnnualContainerStats = {
    annualContainer: [
      {
        containerId: 'f3a1b2c4-d5e6-7890-abcd-ef1234567890',
        containerSize: '0.33',
        containerType: 'bottle',
        reviewAverage: '8.12',
        reviewCount: '42',
        year: '2024'
      }
    ]
  }

  const queryParams: AnnualContainerStatsQueryParams = {
    breweryId: undefined,
    locationId: undefined,
    styleId: 'c186ac2d-021b-4653-a84e-7d041de47d3e',
    pagination: { skip: 0, size: 10 }
  }

  addTestServerResponse<AnnualContainerStats>({
    method: 'GET',
    pathname: `/api/v1/stats/annual_container?size=${
      queryParams.pagination.size
    }&skip=${
      queryParams.pagination.skip
    }&style=${
      queryParams.styleId
    }`,
    response: expectedResponse,
    status: 200
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <AnnualContainerStatsHelper
        queryParams={queryParams}
      />
    </Provider>
  )
  const loadButton = getByRole('button', { name: 'Load' })
  await user.click(loadButton)
  const annualContainer = expectedResponse.annualContainer[0]
  await waitFor(() => {
    expect(getByText(annualContainer.containerType)).toBeDefined()
  })
  expect(getByText(annualContainer.containerSize)).toBeDefined()
  expect(getByText(annualContainer.reviewAverage)).toBeDefined()
  expect(getByText(annualContainer.reviewCount)).toBeDefined()
  expect(getByText(annualContainer.year)).toBeDefined()
})
