import React from 'react'

import type { GetRatingStatsIf } from '../../core/stats/types'

import LoadingIndicator from '../common/LoadingIndicator'

import './StatsTable.css'

interface Props {
  getRatingStatsIf: GetRatingStatsIf
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
}

function Rating (props: Props): React.JSX.Element {
  const { stats, isLoading } = props.getRatingStatsIf.useStats({
    breweryId: props.breweryId,
    locationId: props.locationId,
    styleId: props.styleId
  })
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th>Rating</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {stats?.rating.map(rating => (
            <tr key={rating.rating}>
              <td>{rating.rating}</td>
              <td>{rating.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Rating
