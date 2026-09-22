import type { NavigateIf } from '../../types/types'
import React from 'react'

import SearchBrewery from './SearchBrewery'
import type { SearchBreweryIf } from '../../types/brewery/types'
import { createErrorLogger } from '../error-logger'

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
        navigate(`/breweries/${brewery.id}`).catch(
          createErrorLogger('navigate failed', console.error),
        )
      }}
    />
  )
}

export default SearchBreweryWithNavi
