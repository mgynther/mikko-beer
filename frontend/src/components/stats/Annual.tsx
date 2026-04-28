import React from 'react'

import type { GetAnnualStatsIf } from '../../core/stats/types'

import LoadingIndicator from '../common/LoadingIndicator'

import './StatsTable.css'

interface Props {
  getAnnualStatsIf: GetAnnualStatsIf
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
}

function Annual(props: Props): React.JSX.Element {
  const { stats, isLoading } = props.getAnnualStatsIf.useStats({
    breweryId: props.breweryId,
    locationId: props.locationId,
    styleId: props.styleId,
  })
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th>Year</th>
            <th>n</th>
            <th>Avg</th>
            <th>Med</th>
            <th>Mod</th>
            <th>σ</th>
          </tr>
        </thead>
        <tbody>
          {stats?.annual.map((year) => (
            <tr key={year.year}>
              <td>{year.year}</td>
              <td>{year.reviewCount}</td>
              <td>{year.reviewAverage}</td>
              <td>{year.reviewMedian}</td>
              <td>{year.reviewMode}</td>
              <td>{year.reviewStandardDeviation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Annual
