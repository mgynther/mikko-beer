import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render, waitFor } from '../../../render'
import type {
  AnnualContainerStats,
  OneAnnualContainerStats,
} from '../../../../src/components/types/stats/types'

import AnnualContainerInfiniteScroll from '../../../../src/components/internal/stats/AnnualContainerInfiniteScroll'
import { loadingIndicatorText } from '../../../../src/components/internal/common/LoadingIndicator'
import { updatedItems } from './load-more'

const stats2023: OneAnnualContainerStats = {
  containerId: 'c585a736-2880-47bf-a185-bf0f167cc804',
  containerSize: '0.33',
  containerType: 'bottle',
  reviewAverage: '9.06',
  reviewCount: '63',
  reviewMedian: '9.00',
  reviewMode: '9',
  reviewStandardDeviation: '0.32',
  year: '2023',
}

const stats2022: OneAnnualContainerStats = {
  containerId: '3d052718-30fe-4a1d-838a-2a23924a0172',
  containerSize: '0.44',
  containerType: 'can',
  reviewAverage: '8.12',
  reviewCount: '67',
  reviewMedian: '8.00',
  reviewMode: '8',
  reviewStandardDeviation: '0.67',
  year: '2022',
}

test('queries annual container stats', async () => {
  const query = mockFunction()
  const setLoadedAnnualContainers = mockFunction()
  let loadCallback: () => void = () => undefined
  render(
    <AnnualContainerInfiniteScroll
      getAnnualContainerStatsIf={{
        useStats: () => ({
          query: async (params): Promise<AnnualContainerStats> => {
            query(params)
            return {
              annualContainer: [{ ...stats2023 }, { ...stats2022 }],
            }
          },
          stats: {
            annualContainer: [{ ...stats2023 }, { ...stats2022 }],
          },
          isLoading: false,
        }),
        infiniteScroll: (cb) => {
          loadCallback = cb
          return (): undefined => undefined
        },
      }}
      loadedAnnualContainers={undefined}
      setLoadedAnnualContainers={setLoadedAnnualContainers}
    />,
  )
  assertDeepEqual(query.mock.calls, [])
  loadCallback()
  assertDeepEqual(query.mock.calls, [
    [
      {
        breweryId: undefined,
        locationId: undefined,
        pagination: {
          size: 30,
          skip: 0,
        },
        styleId: undefined,
      },
    ],
  ])
  await waitFor(() => {
    assertDeepEqual(
      updatedItems(setLoadedAnnualContainers.mock.calls, undefined),
      [[stats2023, stats2022]],
    )
  })
})

test('renders annual container stats', async () => {
  const query = mockFunction()
  const setLoadedAnnualContainers = mockFunction()
  const { getByText } = render(
    <AnnualContainerInfiniteScroll
      getAnnualContainerStatsIf={{
        useStats: () => ({
          query: async (params): Promise<AnnualContainerStats> => {
            query(params)
            return {
              annualContainer: [],
            }
          },
          stats: {
            annualContainer: [],
          },
          isLoading: false,
        }),
        infiniteScroll: (): (() => undefined) => () => undefined,
      }}
      loadedAnnualContainers={[stats2023, stats2022]}
      setLoadedAnnualContainers={setLoadedAnnualContainers}
    />,
  )
  await waitFor(() => getByText('bottle 0.33'))
  getByText('63')
  getByText('9.06')
  getByText('2023')
  getByText('can 0.44')
  getByText('67')
  getByText('8.12')
  getByText('8.00')
  getByText('8')
  getByText('0.32')
  getByText('2022')
})

test('renders loading', () => {
  const { getByText } = render(
    <AnnualContainerInfiniteScroll
      getAnnualContainerStatsIf={{
        useStats: () => ({
          query: async (): Promise<AnnualContainerStats> => ({
            annualContainer: [],
          }),
          stats: undefined,
          isLoading: true,
        }),
        infiniteScroll: (): (() => undefined) => () => undefined,
      }}
      loadedAnnualContainers={undefined}
      setLoadedAnnualContainers={() => undefined}
    />,
  )
  getByText(loadingIndicatorText)
})

test('does not try to load more when there is no more', () => {
  let loadCallback: () => void = () => undefined
  const query = mockFunction()
  render(
    <AnnualContainerInfiniteScroll
      getAnnualContainerStatsIf={{
        useStats: () => ({
          query: query,
          stats: {
            annualContainer: [],
          },
          isLoading: false,
        }),
        infiniteScroll: (cb) => {
          loadCallback = cb
          return (): void => undefined
        },
      }}
      loadedAnnualContainers={[]}
      setLoadedAnnualContainers={() => undefined}
    />,
  )
  loadCallback()
  assertDeepEqual(query.mock.calls, [])
})

test('does not try to load more when loading', () => {
  let loadCallback: () => void = () => undefined
  const query = mockFunction()
  render(
    <AnnualContainerInfiniteScroll
      getAnnualContainerStatsIf={{
        useStats: () => ({
          query: query,
          stats: undefined,
          isLoading: true,
        }),
        infiniteScroll: (cb) => {
          loadCallback = cb
          return (): void => undefined
        },
      }}
      loadedAnnualContainers={undefined}
      setLoadedAnnualContainers={() => undefined}
    />,
  )
  loadCallback()
  assertDeepEqual(query.mock.calls, [])
})
