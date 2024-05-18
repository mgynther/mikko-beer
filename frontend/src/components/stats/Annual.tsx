import { useGetAnnualStatsQuery } from '../../store/stats/api'

import LoadingIndicator from '../common/LoadingIndicator'

import './Stats.css'

interface Props {
  breweryId: string | undefined
  styleId: string | undefined
}

function Annual (props: Props): JSX.Element {
  const { data: annualData, isLoading } =
    useGetAnnualStatsQuery(props)
  const annual = annualData?.annual
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
          {annual?.map(year => (
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
