import { useListStylesQuery } from '../../store/style/api'
import { type Style } from '../../store/style/types'

import LoadingIndicator from '../common/LoadingIndicator'

function Styles (): JSX.Element {
  const { data: styleData, isLoading } = useListStylesQuery()

  const styleArray = styleData?.styles === undefined
    ? []
    : [...styleData.styles]
  const styles = styleArray
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      <h3>Styles</h3>
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {styles.map((style: Style) => (
          <li key={style.id}>{style.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default Styles
