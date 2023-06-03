import { useListStylesQuery } from '../../store/style/api'
import { type StyleWithParentIds } from '../../store/style/types'

import LoadingIndicator from '../common/LoadingIndicator'
import Style from './Style'

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
        {styles.map((style: StyleWithParentIds) => (
          <li key={style.id} className='RowLike'>
            <Style style={style} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Styles
