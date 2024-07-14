import { useNavigate } from 'react-router-dom'

import { useListStylesQuery } from '../../store/style/api'
import type {
  ListStylesIf,
  Style,
  StyleWithParentIds
} from '../../core/style/types'

import LoadingIndicator from '../common/LoadingIndicator'
import SearchStyle from './SearchStyle'
import StyleLink from './StyleLink'

interface Props {
  listStylesIf: ListStylesIf
}

function Styles (props: Props): JSX.Element {
  const navigate = useNavigate()
  const { data: styleData, isLoading } = useListStylesQuery()

  const styleArray = styleData?.styles === undefined
    ? []
    : [...styleData.styles]
  const styles = styleArray
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      <h3>Styles</h3>
      <SearchStyle
        listStylesIf={props.listStylesIf}
        select={(style: Style) => {
          navigate(`/styles/${style.id}`)
        }}
      />
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {styles.map((style: StyleWithParentIds) => (
          <li key={style.id} className='RowLike'>
            <StyleLink style={style} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Styles
