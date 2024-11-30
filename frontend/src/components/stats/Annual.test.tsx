import { render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Annual from './Annual'
import type { BreweryStyleParams } from '../../core/stats/types'

test('renders annual stats', () => {
  const stats = vitest.fn()
  const breweryId = 'e6887360-78da-49e2-b876-68477c79c776'
  const styleId = '2b885977-a2fd-43c2-95f9-6b19f3c8054d'
  const { getByText } = render(
    <Annual
      getAnnualStatsIf={{
        useStats: (params: BreweryStyleParams) => {
          stats(params)
          return {
            stats: {
              annual: [
                { reviewAverage: '7.87', reviewCount: '10', year: '2020' },
                { reviewAverage: '8.23', reviewCount: '24', year: '2021' }
              ]
            },
            isLoading: false
          }
        }
      }}
      breweryId={breweryId}
      styleId={styleId}
    />
  )
  expect(stats.mock.calls).toEqual([[{ breweryId, styleId }]])
  getByText('7.87')
  getByText('10')
  getByText('2020')
  getByText('8.23')
  getByText('24')
  getByText('2021')
})
