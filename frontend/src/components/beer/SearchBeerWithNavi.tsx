import React from 'react'

import SearchBeer from './SearchBeer'
import type { SearchBeerIf } from '../../core/beer/types'
import type { SearchFieldIf } from '../../core/search/types'
import type { NavigateIf } from '../../navigation'

interface Props {
  navigateIf: NavigateIf
  searchBeerIf: SearchBeerIf
  searchFieldIf: SearchFieldIf
}

function SearchBeerWithNavi(props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  return (
    <SearchBeer
      searchFieldIf={props.searchFieldIf}
      searchBeerIf={props.searchBeerIf}
      select={(beer) => {
        void navigate(`/beers/${beer.id}`)
      }}
    />
  )
}

export default SearchBeerWithNavi
