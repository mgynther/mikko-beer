import { render, waitFor } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import type { OneAnnualContainerStats } from '../../core/stats/types'

import AnnualContainerInfiniteScroll from './AnnualContainerInfiniteScroll'

const stats2023: OneAnnualContainerStats = {
  containerId: 'c585a736-2880-47bf-a185-bf0f167cc804',
  containerSize: '0.33',
  containerType: 'bottle',
  reviewAverage: '9.06',
  reviewCount: '63',
  year: '2023'
}

const stats2022: OneAnnualContainerStats = {
  containerId: '3d052718-30fe-4a1d-838a-2a23924a0172',
  containerSize: '0.44',
  containerType: 'can',
  reviewAverage: '9.12',
  reviewCount: '67',
  year: '2022'
}

test('queries annual container stats', async () => {
  const query = vitest.fn()
  const setLoadedAnnualContainers = vitest.fn()
  let loadCallback: () => void = () => undefined
  render(
    <AnnualContainerInfiniteScroll
      getAnnualContainerStatsIf={{
        useStats: () => ({
          query: async (params) => {
            query(params)
            return {
              annualContainer: [
                { ...stats2023 },
                { ...stats2022 }
              ]
            }
          },
          stats: {
            annualContainer: [
              { ...stats2023 },
              { ...stats2022 }
            ]
          },
          isLoading: false
        }),
        infiniteScroll: (cb) => {
          loadCallback = cb
          return () => undefined
        }
      }}
      loadedAnnualContainers={undefined}
      setLoadedAnnualContainers={setLoadedAnnualContainers}
    />
  )
  expect(query.mock.calls).toEqual([])
  loadCallback()
  expect(query.mock.calls).toEqual([[{
    pagination: {
      size: 30,
      skip: 0
    },
  }]])
  await waitFor(() =>
    { expect(setLoadedAnnualContainers.mock.calls).toEqual([
      [[stats2023, stats2022]]
    ]); }
  )
})

test('renders annual container stats', async () => {
  const query = vitest.fn()
  const setLoadedAnnualContainers = vitest.fn()
  const { getByText } = render(
    <AnnualContainerInfiniteScroll
      getAnnualContainerStatsIf={{
        useStats: () => ({
          query: async (params) => {
            query(params)
            return {
              annualContainer: []
            }
          },
          stats: {
            annualContainer: []
          },
          isLoading: false
        }),
        infiniteScroll: () => () => undefined
      }}
      loadedAnnualContainers={[ stats2023, stats2022 ]}
      setLoadedAnnualContainers={setLoadedAnnualContainers}
    />
  )
  await waitFor(() => getByText('bottle 0.33'))
  getByText('63')
  getByText('9.06')
  getByText('2023')
  getByText('can 0.44')
  getByText('67')
  getByText('9.12')
  getByText('2022')
})
