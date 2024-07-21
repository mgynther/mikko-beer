import { useNavigate } from 'react-router-dom'

import SearchBeer from './SearchBeer'
import type { SearchBeerIf } from '../../core/beer/types'

interface Props {
  searchBeerIf: SearchBeerIf
}

function SearchBeerWithNavi (props: Props): JSX.Element {
  const navigate = useNavigate()
  return (
    <SearchBeer
      searchBeerIf={props.searchBeerIf}
      select={(beer) => {
        navigate(`/beers/${beer.id}`)
      }
    } />
  )
}

export default SearchBeerWithNavi
