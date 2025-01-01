import React from 'react'

import type { GetContainerStatsIf } from '../../core/stats/types'

import LoadingIndicator from '../common/LoadingIndicator'

import './StatsTable.css'
import { asText } from '../container/ContainerInfo'

interface Props {
  getContainerStatsIf: GetContainerStatsIf
  breweryId: string | undefined
  styleId: string | undefined
}

function Container (props: Props): React.JSX.Element {
  const { stats, isLoading } = props.getContainerStatsIf.useStats({
    breweryId: props.breweryId,
    styleId: props.styleId
  })
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th>Container</th>
            <th>Reviews</th>
            <th>Review rating average</th>
          </tr>
        </thead>
        <tbody>
          {stats?.container.map(container => (
            <tr key={container.containerId}>
              <td>{asText({
                id: container.containerId,
                size: container.containerSize,
                type: container.containerType
              })}</td>
              <td>{container.reviewCount}</td>
              <td>{container.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Container
