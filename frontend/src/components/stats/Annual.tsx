import { useGetAnnualQuery } from '../../store/stats/api'

import LoadingIndicator from '../LoadingIndicator'

import './Stats.css'

function Annual (): JSX.Element {
  const { data: annualData, isLoading } = useGetAnnualQuery()
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
