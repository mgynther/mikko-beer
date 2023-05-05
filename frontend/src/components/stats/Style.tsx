import { useGetStyleStatsQuery } from '../../store/stats/api'

import LoadingIndicator from '../LoadingIndicator'

import './Stats.css'

function Style (): JSX.Element {
  const { data: styleData, isLoading } = useGetStyleStatsQuery()
  const style = styleData?.style
  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th>Style</th>
            <th>Reviews</th>
            <th>Review rating average</th>
          </tr>
        </thead>
        <tbody>
          {style?.map(style => (
            <tr key={style.styleId}>
              <td>{style.styleName}</td>
              <td>{style.reviewCount}</td>
              <td>{style.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Style
