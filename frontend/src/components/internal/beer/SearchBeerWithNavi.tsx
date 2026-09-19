import type { NavigateIf } from '../../types/types'
import React from 'react'

import SearchBeer from './SearchBeer'
import type { SearchBeerIf } from '../../types/beer/types'

interface Props {
  navigateIf: NavigateIf
  searchBeerIf: SearchBeerIf
}

function SearchBeerWithNavi(props: Props): React.JSX.Element {
  const navigate = props.navigateIf.useNavigate()
  return (
    <SearchBeer
      searchBeerIf={props.searchBeerIf}
      select={(beer) => {
        void navigate(`/beers/${beer.id}`)
      }}
    />
  )
}

export default SearchBeerWithNavi
