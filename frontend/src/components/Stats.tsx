import { useGetStatsQuery } from '../store/stats/api'

import LoadingIndicator from './LoadingIndicator'

import './Stats.css'

function Stats (): JSX.Element {
  const { data: statsData, isLoading } = useGetStatsQuery()
  const stats = statsData?.stats
  return (
    <div>
      <h3>Statistics</h3>
      <LoadingIndicator isLoading={isLoading} />
      {stats !== undefined && (
        <>
          <h4>Overall</h4>
          <table className='StatsTable'>
            <tr>
              <td>Beers</td>
              <td>{stats.beerCount}</td>
            </tr>
            <tr>
              <td>Containers</td>
              <td>{stats.containerCount}</td>
            </tr>
            <tr>
              <td>Reviews</td>
              <td>{stats.reviewCount}</td>
            </tr>
            <tr>
              <td>Review rating average</td>
              <td>{stats.reviewAverage}</td>
            </tr>
            <tr>
              <td>Styles</td>
              <td>{stats.styleCount}</td>
            </tr>
          </table>
          <h4>Annual</h4>
          <table className='StatsTable'>
            <tr>
              <th>Year</th>
              <th>Reviews</th>
              <th>Review rating average</th>
            </tr>
            {stats.annual.map(year => (
              <tr>
                <td>{year.year}</td>
                <td>{year.reviewCount}</td>
                <td>{year.reviewAverage}</td>
              </tr>
            ))}
          </table>
          <h4>By style</h4>
          <table className='StatsTable'>
            <tr>
              <th>Style</th>
              <th>Reviews</th>
              <th>Review rating average</th>
            </tr>
            {stats.styles.map(style => (
              <tr>
                <td>{style.styleName}</td>
                <td>{style.reviewCount}</td>
                <td>{style.reviewAverage}</td>
              </tr>
            ))}
          </table>
        </>
      )}
    </div>
  )
}

export default Stats
