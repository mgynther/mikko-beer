import { useNavigate } from 'react-router-dom'

import SearchBeer from './SearchBeer'
import type { SearchBeerIf } from '../../core/beer/types'
import type { SearchIf } from '../../core/search/types'

interface Props {
  searchBeerIf: SearchBeerIf
  searchIf: SearchIf
}

function SearchBeerWithNavi (props: Props): JSX.Element {
  const navigate = useNavigate()
  return (
    <SearchBeer
      searchIf={props.searchIf}
      searchBeerIf={props.searchBeerIf}
      select={(beer) => {
        navigate(`/beers/${beer.id}`)
      }
    } />
  )
}

export default SearchBeerWithNavi
