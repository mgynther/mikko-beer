import { useNavigate } from 'react-router-dom'

import SearchBrewery from './SearchBrewery'
import type { SearchBreweryIf } from '../../core/brewery/types'
import type { SearchIf } from '../../core/search/types'

export interface Props {
  searchIf: SearchIf
  searchBreweryIf: SearchBreweryIf
}

function SearchBreweryWithNavi (props: Props): JSX.Element {
  const navigate = useNavigate()
  return (
    <SearchBrewery
      searchIf={props.searchIf}
      searchBreweryIf={props.searchBreweryIf}
      select={(brewery) => {
        navigate(`/breweries/${brewery.id}`)
      }} />
  )
}

export default SearchBreweryWithNavi
