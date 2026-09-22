import type { NavigateIf } from '../../types/types'
import React from 'react'

import SearchBeer from './SearchBeer'
import type { SearchBeerIf } from '../../types/beer/types'
import { createErrorLogger } from '../error-logger'

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
        navigate(`/beers/${beer.id}`).catch(
          createErrorLogger('navigate failed', console.error),
        )
      }}
    />
  )
}

export default SearchBeerWithNavi
