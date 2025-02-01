import React from 'react'

import SearchLocation from './SearchLocation'
import type { SearchLocationIf } from '../../core/location/types'
import type { SearchIf } from '../../core/search/types'
import type { NavigateIf } from '../util'

export interface Props {
  navigateIf: NavigateIf
  searchIf: SearchIf
  searchLocationIf: SearchLocationIf
}

function SearchLocationWithNavi (props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  return (
    <SearchLocation
      isCreateEnabled={false}
      searchIf={props.searchIf}
      searchLocationIf={props.searchLocationIf}
      select={(location) => {
        void navigate(`/locations/${location.id}`)
      }} />
  )
}

export default SearchLocationWithNavi
