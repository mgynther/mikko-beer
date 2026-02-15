import { render } from '@testing-library/react'
import { test } from 'vitest'
import MonthlyStats from './MonthlyStats'

test('renders monthly storage stats', () => {
  const { getByText } = render(
    <MonthlyStats
      monthlyStatsIf={{
        useMonthlyStats: () => ({
            stats: {
              monthly: [
                { year: '2021', month: '4', count: '8' },
                { year: '2024', month: '10', count: '15' },
              ]
            },
            isLoading: false
          })
      }}
    />
  )
  getByText('2021-04')
  getByText('8')
  getByText('2024-10')
  getByText('15')
})
