import { useGetOverallQuery } from '../../store/stats/api'

import LoadingIndicator from '../LoadingIndicator'

import './Stats.css'

function Overall (): JSX.Element {
  const { data: overallData, isLoading } = useGetOverallQuery()
  const overall = overallData?.overall
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      {overall !== undefined && (
        <table className='StatsTable'>
          <tbody>
            <tr>
              <td>Beers</td>
              <td>{overall.beerCount}</td>
            </tr>
            <tr>
              <td>Containers</td>
              <td>{overall.containerCount}</td>
            </tr>
            <tr>
              <td>Reviews</td>
              <td>{overall.reviewCount}</td>
            </tr>
            <tr>
              <td>Review rating average</td>
              <td>{overall.reviewAverage}</td>
            </tr>
            <tr>
              <td>Styles</td>
              <td>{overall.styleCount}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Overall
