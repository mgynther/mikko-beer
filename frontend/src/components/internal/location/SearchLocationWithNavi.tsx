import type { NavigateIf } from '../../types/types'
import React from 'react'

import SearchLocation from './SearchLocation'
import { confirmDialog } from '../confirm'
import type { SearchLocationIf } from '../../types/location/types'

export interface Props {
  navigateIf: NavigateIf
  searchLocationIf: SearchLocationIf
}

function SearchLocationWithNavi(props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  return (
    <SearchLocation
      confirm={confirmDialog}
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
