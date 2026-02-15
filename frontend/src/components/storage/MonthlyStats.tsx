import React from 'react'

import type { GetMonthlyStorageStatsIf } from "../../core/storage/types"
import LoadingIndicator from '../common/LoadingIndicator'

interface Props {
  monthlyStatsIf: GetMonthlyStorageStatsIf
}

function prefix(month: string): string {
  if (month.length > 1) {
    return month
  }
  return `0${month}`
}

function MonthlyStats (props: Props): React.JSX.Element | null {
  const { stats, isLoading } = props.monthlyStatsIf.useMonthlyStats()
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th>Month</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {stats?.monthly.map(month => (
            <tr key={`${month.year}-${month.month}`}>
              <td>{`${month.year}-${prefix(month.month)}`}</td>
              <td>{month.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MonthlyStats
