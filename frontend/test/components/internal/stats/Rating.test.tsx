import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import Rating from '../../../../src/components/internal/stats/Rating'
import type { IdParams } from '../../../../src/components/types/stats/types'

test('renders rating stats', () => {
  const stats = mockFunction<[params: IdParams]>()
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
                { rating: '8', count: '11' },
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
  assertDeepEqual(stats.mock.calls, [[{ breweryId, locationId, styleId }]])
  getByText('7')
  getByText('10')
  getByText('8')
  getByText('11')
})
