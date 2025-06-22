import React from 'react'

import type { OneAnnualContainerStats } from '../../core/stats/types'

import LoadingIndicator from '../common/LoadingIndicator'

import './StatsTable.css'
import { asText } from '../container/ContainerInfo'

interface Props {
  annualContainers: OneAnnualContainerStats[]
  isLoading: boolean
}

function AnnualContainerStatsTable (props: Props): React.JSX.Element {
  return (
    <div>
      <LoadingIndicator isLoading={props.isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th>Year</th>
            <th>Container</th>
            <th>Reviews</th>
            <th>Review rating average</th>
          </tr>
        </thead>
        <tbody>
          {props.annualContainers.map(annualContainer => (
            <tr key={`${annualContainer.year}-${annualContainer.containerId}`}>
              <td>{annualContainer.year}</td>
              <td>{asText({
                id: annualContainer.containerId,
                size: annualContainer.containerSize,
                type: annualContainer.containerType
              })}</td>
              <td>{annualContainer.reviewCount}</td>
              <td>{annualContainer.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AnnualContainerStatsTable
