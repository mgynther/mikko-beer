import { render, waitFor } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import type { OneAnnualContainerStats } from '../../core/stats/types'

import AnnualContainerAllAtOnce from './AnnualContainerAllAtOnce'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const breweryId = '05ad469a-21ea-4be7-8112-68ef9ee65617'
const locationId = '6cb586b2-f4fe-4b85-9c40-96897cd367a5'
const styleId = '0829e899-7ed3-4b19-ab21-7d3df0fc325a'

const stats2023: OneAnnualContainerStats = {
  containerId: 'f0112975-c357-4494-95f0-6c97161def08',
  containerSize: '0.33',
  containerType: 'bottle',
  reviewAverage: '9.06',
  reviewCount: '63',
  year: '2023'
}

const stats2022: OneAnnualContainerStats = {
  containerId: 'a14e52fd-6f9b-41eb-b2c5-8e2a85284865',
  containerSize: '0.44',
  containerType: 'can',
  reviewAverage: '9.12',
  reviewCount: '67',
  year: '2022'
}

test('queries annual container stats', async () => {
  const query = vitest.fn()
  const setLoadedAnnualContainers = vitest.fn()
  render(
    <AnnualContainerAllAtOnce
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
        infiniteScroll: dontCall
      }}
      breweryId={breweryId}
      locationId={locationId}
      styleId={styleId}
      loadedAnnualContainers={undefined}
      setLoadedAnnualContainers={setLoadedAnnualContainers}
    />
  )
  expect(query.mock.calls).toEqual([[{
    breweryId,
    locationId,
    pagination: {
      size: 10000,
      skip: 0
    },
    styleId
  }]])
  await waitFor(() =>
    { expect(setLoadedAnnualContainers.mock.calls).toEqual([
      [undefined],
      [undefined],
      [[stats2023, stats2022]]
    ]); }
  )
})

test('renders annual container stats', async () => {
  const query = vitest.fn()
  const setLoadedAnnualContainers = vitest.fn()
  const { getByText } = render(
    <AnnualContainerAllAtOnce
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
        infiniteScroll: dontCall
      }}
      breweryId={breweryId}
      locationId={locationId}
      styleId={styleId}
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
