import { render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Rating from './Rating'
import type { IdParams } from '../../core/stats/types'

test('renders rating stats', () => {
  const stats = vitest.fn()
  const breweryId = '6b6d5183-8ac7-45d0-b11c-6a5b995f36fc'
  const locationId = 'c554f83e-3962-4d8d-8221-f1e282ca9c05'
  const styleId = '6526fcde-5b04-4be8-a3f6-79d2e32350cb'
  const { getByText } = render(
    <Rating
      getRatingStatsIf={{
        useStats: (params: IdParams) => {
          stats(params)
          return {
            stats: {
              rating: [
                { rating: '7', count: '10' },
                { rating: '8', count: '11' }
              ]
            },
            isLoading: false
          }
        }
      }}
      breweryId={breweryId}
      locationId={locationId}
      styleId={styleId}
    />
  )
  expect(stats.mock.calls).toEqual([[{ breweryId, locationId, styleId }]])
  getByText('7')
  getByText('10')
  getByText('8')
  getByText('11')
})
