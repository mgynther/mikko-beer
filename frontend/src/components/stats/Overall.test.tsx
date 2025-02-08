import { render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Overall from './Overall'
import type { BreweryStyleParams } from '../../core/stats/types'

test('renders overall stats', () => {
  const stats = vitest.fn()
  const breweryId = '927a5106-1c3a-470f-b5a4-c9cbea05c112'
  const styleId = '1afa8a5b-186f-40fd-b92f-42b1874091ac'
  const { getByText } = render(
    <Overall
      getOverallStatsIf={{
        useStats: (params: BreweryStyleParams) => {
          stats(params)
          return {
            stats: {
              beerCount: '123',
              breweryCount: '54',
              containerCount: '8',
              locationCount: '5',
              reviewCount: '112',
              distinctBeerReviewCount: '110',
              reviewAverage: '8.54',
              styleCount: '29'
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
  getByText('123')
  getByText('54')
  getByText('8')
  getByText('5')
  getByText('112')
  getByText('110')
  getByText('8.54')
  getByText('29')
})
