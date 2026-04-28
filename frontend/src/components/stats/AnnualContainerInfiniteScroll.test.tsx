import { render, waitFor } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import type {
  AnnualContainerStats,
  OneAnnualContainerStats,
} from '../../core/stats/types'

import AnnualContainerInfiniteScroll from './AnnualContainerInfiniteScroll'
import { loadingIndicatorText } from '../common/LoadingIndicator'

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
  const query = vitest.fn()
  const setLoadedAnnualContainers = vitest.fn()
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
  expect(query.mock.calls).toEqual([])
  loadCallback()
  expect(query.mock.calls).toEqual([
    [
      {
        pagination: {
          size: 30,
          skip: 0,
        },
      },
    ],
  ])
  await waitFor(() => {
    expect(setLoadedAnnualContainers.mock.calls).toEqual([
      [[stats2023, stats2022]],
    ])
  })
})

test('renders annual container stats', async () => {
  const query = vitest.fn()
  const setLoadedAnnualContainers = vitest.fn()
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
  const query = vitest.fn()
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
  expect(query.mock.calls).toEqual([])
})

test('does not try to load more when loading', () => {
  let loadCallback: () => void = () => undefined
  const query = vitest.fn()
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
  expect(query.mock.calls).toEqual([])
})
