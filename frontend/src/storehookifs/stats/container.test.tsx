import { expect, test } from 'vitest'
import { infiniteScroll } from "../../components/util"
import type { NavigateIf } from "../../components/util";
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import statsHook from './stats'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

import type {
  ContainerStats,
  IdParams,
  YearMonth
} from '../../core/stats/types'
import type { UseDebounce } from '../../core/types'

const minTime: YearMonth = { year: 2017, month: 12 }
const maxTime: YearMonth = { year: 2024, month: 12 }

const getUseDebounce = function<T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

function ContainerStatsHelper(
  props: { params: IdParams }
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
  const { stats } =
    statsIf.container.useStats(props.params)
  return (
    <div>
      {stats?.container.map(container =>
        <div key={container.containerId}>
          <div>{container.containerType}</div>
          <div>{container.containerSize}</div>
          <div>{container.reviewAverage}</div>
          <div>{container.reviewCount}</div>
        </div>
      )}
    </div>
  )
}

test('container stats', async () => {
  const expectedResponse: ContainerStats = {
    container: [{
      containerId: 'a7b8c9d0-e1f2-3456-abcd-ef1234567890',
      containerSize: '0.50',
      containerType: 'can',
      reviewAverage: '7.55',
      reviewCount: '88'
    }]
  }

  const params: IdParams = {
    breweryId: undefined,
    locationId: '7f67282b-a8b9-4424-b43d-df6f41c7c48f',
    styleId: undefined
  }

  addTestServerResponse<ContainerStats>({
    method: 'GET',
    pathname: `/api/v1/stats/container?location=${params.locationId}`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <ContainerStatsHelper params={params} />
    </Provider>
  )
  const container = expectedResponse.container[0]
  await waitFor(() => {
    expect(getByText(container.containerType)).toBeDefined()
  })
  expect(getByText(container.containerSize)).toBeDefined()
  expect(getByText(container.reviewAverage)).toBeDefined()
  expect(getByText(container.reviewCount)).toBeDefined()
})
