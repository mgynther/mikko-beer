import React from 'react'

import SearchBrewery from './SearchBrewery'
import type { SearchBreweryIf } from '../../core/brewery/types'
import type { NavigateIf } from '../../navigation'

export interface Props {
  navigateIf: NavigateIf
  searchBreweryIf: SearchBreweryIf
}

function SearchBreweryWithNavi(props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  return (
    <SearchBrewery
      searchBreweryIf={props.searchBreweryIf}
      select={(brewery) => {
        void navigate(`/breweries/${brewery.id}`)
      }}
    />
  )
}

export default SearchBreweryWithNavi
