import React from 'react'

import SearchBeer from './SearchBeer'
import type { SearchBeerIf } from '../../core/beer/types'
import type { SearchIf } from '../../core/search/types'
import type { NavigateIf } from '../util'

interface Props {
  navigateIf: NavigateIf
  searchBeerIf: SearchBeerIf
  searchIf: SearchIf
}

function SearchBeerWithNavi (props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  return (
    <SearchBeer
      searchIf={props.searchIf}
      searchBeerIf={props.searchBeerIf}
      select={(beer) => {
        void navigate(`/beers/${beer.id}`)
      }
    } />
  )
}

export default SearchBeerWithNavi
