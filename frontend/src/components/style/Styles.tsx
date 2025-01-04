import React from 'react'

import type { SearchIf } from '../../core/search/types'
import type {
  ListStylesIf,
  Style,
  StyleWithParentIds
} from '../../core/style/types'

import LoadingIndicator from '../common/LoadingIndicator'
import SearchStyle from './SearchStyle'
import StyleLink from './StyleLink'
import type { NavigateIf } from '../util'

interface Props {
  listStylesIf: ListStylesIf
  navigateIf: NavigateIf
  searchIf: SearchIf
}

function Styles (props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  const { styles, isLoading } = props.listStylesIf.useList()

  const styleArray = styles === undefined
    ? []
    : [...styles]
  const sortedStyles = styleArray
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      <h3>Styles</h3>
      <SearchStyle
        listStylesIf={props.listStylesIf}
        searchIf={props.searchIf}
        select={(style: Style) => {
          void navigate(`/styles/${style.id}`)
        }}
      />
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {sortedStyles.map((style: StyleWithParentIds) => (
          <li key={style.id} className='RowLike'>
            <StyleLink style={style} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Styles
