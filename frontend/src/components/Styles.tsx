import { useListStylesQuery } from '../store/style/api'
import { type Style } from '../store/style/types'

function Styles (): JSX.Element {
  const { data: styleData, isLoading } = useListStylesQuery()
  return (
    <div>
      <h3>Styles</h3>
      {isLoading && (<div>Loading...</div>)}
      <ul>
        {styleData?.styles.map((style: Style) => (
          <li key={style.id}>{style.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default Styles
