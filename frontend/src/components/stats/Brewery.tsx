import { useGetBreweryStatsQuery } from '../../store/stats/api'

import LoadingIndicator from '../LoadingIndicator'

import './Stats.css'

function Brewery (): JSX.Element {
  const { data: breweryData, isLoading } = useGetBreweryStatsQuery()
  const brewery = breweryData?.brewery
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th>Brewery</th>
            <th>Reviews</th>
            <th>Review rating average</th>
          </tr>
        </thead>
        <tbody>
          {brewery?.map(brewery => (
            <tr key={brewery.breweryId}>
              <td>{brewery.breweryName}</td>
              <td>{brewery.reviewCount}</td>
              <td>{brewery.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Brewery
