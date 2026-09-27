import { test } from '../../../test'
import { render } from '../../../render'
import AnnualStats from '../../../../src/components/internal/storage/AnnualStats'

test('renders annual storage stats', () => {
  const { getByText } = render(
    <AnnualStats
      annualStatsIf={{
        useAnnualStats: () => ({
          stats: {
            annual: [
              { year: '2021', count: '8' },
              { year: '2024', count: '15' },
            ],
          },
          isLoading: false,
        }),
      }}
    />,
  )
  getByText('2021')
  getByText('8')
  getByText('2024')
  getByText('15')
})
