import type { GetOverallStatsIf } from '../../core/stats/types'

import LoadingIndicator from '../common/LoadingIndicator'

import './StatsTable.css'

interface Props {
  getOverallStatsIf: GetOverallStatsIf
  breweryId: string | undefined
  styleId: string | undefined
}

function Overall (props: Props): JSX.Element {
  const { stats, isLoading } = props.getOverallStatsIf.useStats({
    breweryId: props.breweryId,
    styleId: props.styleId
  })
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      {stats !== undefined && (
        <table className='StatsTable'>
          <tbody>
            <tr>
              <td>Beers</td>
              <td>{stats.beerCount}</td>
            </tr>
            <tr>
              <td>Breweries</td>
              <td>{stats.breweryCount}</td>
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
              <td>Beers reviewed</td>
              <td>{stats.distinctBeerReviewCount}</td>
            </tr>
            <tr>
              <td>Review rating average</td>
              <td>{stats.reviewAverage}</td>
            </tr>
            <tr>
              <td>Styles</td>
              <td>{stats.styleCount}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Overall
