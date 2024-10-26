import type { GetAnnualStatsIf } from '../../core/stats/types'

import LoadingIndicator from '../common/LoadingIndicator'

import './StatsTable.css'

interface Props {
  getAnnualStatsIf: GetAnnualStatsIf
  breweryId: string | undefined
  styleId: string | undefined
}

function Annual (props: Props): JSX.Element {
  const { stats, isLoading } = props.getAnnualStatsIf.useStats({
    breweryId: props.breweryId,
    styleId: props.styleId
  })
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th>Year</th>
            <th>Reviews</th>
            <th>Review rating average</th>
          </tr>
        </thead>
        <tbody>
          {stats?.annual.map(year => (
            <tr key={year.year}>
              <td>{year.year}</td>
              <td>{year.reviewCount}</td>
              <td>{year.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Annual
