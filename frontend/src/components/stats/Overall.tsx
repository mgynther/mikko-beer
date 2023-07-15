import { useGetOverallStatsQuery } from '../../store/stats/api'

import LoadingIndicator from '../common/LoadingIndicator'

import './Stats.css'

interface Props {
  breweryId: string | undefined
}

function Overall (props: Props): JSX.Element {
  const { data: overallData, isLoading } =
    useGetOverallStatsQuery(props.breweryId)
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
              <td>Breweries</td>
              <td>{overall.breweryCount}</td>
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
