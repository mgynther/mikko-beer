import { render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Annual from './Annual'
import type { IdParams } from '../../core/stats/types'

test('renders annual stats', () => {
  const stats = vitest.fn()
  const breweryId = 'e6887360-78da-49e2-b876-68477c79c776'
  const locationId = 'ab7b1a78-802f-4f63-a0d0-7b3ec9551390'
  const styleId = '2b885977-a2fd-43c2-95f9-6b19f3c8054d'
  const { getByText } = render(
    <Annual
      getAnnualStatsIf={{
        useStats: (params: IdParams) => {
          stats(params)
          return {
            stats: {
              annual: [
                {
                  reviewAverage: '8.23',
                  reviewCount: '24',
                  reviewMedian: '8.50',
                  reviewMode: '8',
                  reviewStandardDeviation: '0.45',
                  year: '2021',
                },
                {
                  reviewAverage: '7.87',
                  reviewCount: '10',
                  reviewMedian: '9.00',
                  reviewMode: '9',
                  reviewStandardDeviation: '0.34',
                  year: '2020',
                },
              ],
            },
            isLoading: false,
          }
        },
      }}
      breweryId={breweryId}
      locationId={locationId}
      styleId={styleId}
    />,
  )
  expect(stats.mock.calls).toEqual([[{ breweryId, locationId, styleId }]])
  getByText('8.23')
  getByText('8.50')
  getByText('8')
  getByText('0.45')
  getByText('24')
  getByText('2021')
  getByText('7.87')
  getByText('9.00')
  getByText('9')
  getByText('0.34')
  getByText('10')
  getByText('2020')
})
