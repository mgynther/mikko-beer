import React from 'react'

import type { GetAnnualStorageStatsIf } from '../../core/storage/types'
import LoadingIndicator from '../common/LoadingIndicator'

interface Props {
  annualStatsIf: GetAnnualStorageStatsIf
}

function AnnualStats(props: Props): React.JSX.Element | null {
  const { stats, isLoading } = props.annualStatsIf.useAnnualStats()
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th>Year</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {stats?.annual.map((month) => (
            <tr key={month.year}>
              <td>{month.year}</td>
              <td>{month.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AnnualStats
