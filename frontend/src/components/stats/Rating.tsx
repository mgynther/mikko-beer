import { useGetRatingStatsQuery } from '../../store/stats/api'

import LoadingIndicator from '../common/LoadingIndicator'

import './Stats.css'

interface Props {
  breweryId: string | undefined
  styleId: string | undefined
}

function Rating (props: Props): JSX.Element {
  const { data: ratingData, isLoading } =
    useGetRatingStatsQuery(props)
  const rating = ratingData?.rating
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th>Rating</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {rating?.map(rating => (
            <tr key={rating.rating}>
              <td>{rating.rating}</td>
              <td>{rating.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Rating
