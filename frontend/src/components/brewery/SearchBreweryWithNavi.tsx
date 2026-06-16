import React from 'react'

import SearchBrewery from './SearchBrewery'
import type { SearchBreweryIf } from '../../core/brewery/types'
import type { SearchFieldIf } from '../../core/search/types'
import type { NavigateIf } from '../../navigation'

export interface Props {
  navigateIf: NavigateIf
  searchFieldIf: SearchFieldIf
  searchBreweryIf: SearchBreweryIf
}

function SearchBreweryWithNavi(props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  return (
    <SearchBrewery
      searchFieldIf={props.searchFieldIf}
      searchBreweryIf={props.searchBreweryIf}
      select={(brewery) => {
        void navigate(`/breweries/${brewery.id}`)
      }}
    />
  )
}

export default SearchBreweryWithNavi
