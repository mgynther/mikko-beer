import React from 'react'

import SearchLocation from './SearchLocation'
import type { SearchLocationIf } from '../../core/location/types'
import type { NavigateIf } from '../../navigation'

export interface Props {
  navigateIf: NavigateIf
  searchLocationIf: SearchLocationIf
}

function SearchLocationWithNavi(props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  return (
    <SearchLocation
      confirm={confirm}
      isCreateEnabled={false}
      placeholderText={'Search location'}
      searchLocationIf={props.searchLocationIf}
      select={(location) => {
        void navigate(`/locations/${location.id}`)
      }}
    />
  )
}

export default SearchLocationWithNavi
