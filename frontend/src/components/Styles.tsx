import { useListStylesQuery } from '../store/style/api'
import { type Style } from '../store/style/types'

import LoadingIndicator from './LoadingIndicator'

function Styles (): JSX.Element {
  const { data: styleData, isLoading } = useListStylesQuery()
  return (
    <div>
      <h3>Styles</h3>
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {styleData?.styles.map((style: Style) => (
          <li key={style.id}>{style.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default Styles
