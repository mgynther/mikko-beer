import type { NavigateIf } from '../types/types'
import React from 'react'

import type {
  ListStylesIf,
  Style,
  StyleWithParentIds,
} from '../types/style/types'

import LoadingIndicator from '../internal/common/LoadingIndicator'
import SearchStyle from '../internal/style/SearchStyle'
import StyleLink from '../internal/style/StyleLink'
import type { LinkComponent } from '../common/link'
import { createErrorLogger } from '../internal/error-logger'

interface Props {
  linkComponent: LinkComponent
  listStylesIf: ListStylesIf
  navigateIf: NavigateIf
}

function Styles(props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  const { styles, isLoading } = props.listStylesIf.useList()

  const styleArray = styles === undefined ? [] : [...styles]
  const sortedStyles = styleArray.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      <h3>Styles</h3>
      <SearchStyle
        listStylesIf={props.listStylesIf}
        select={(style: Style) => {
          navigate(`/styles/${style.id}`).catch(
            createErrorLogger('navigate failed', console.error),
          )
        }}
      />
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {sortedStyles.map((style: StyleWithParentIds) => (
          <li key={style.id} className='RowLike'>
            <StyleLink linkComponent={props.linkComponent} style={style} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Styles
