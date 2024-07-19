import { useNavigate } from 'react-router-dom'

import SearchBrewery from './SearchBrewery'
import type { SearchBreweryIf } from '../../core/brewery/types'

export interface Props {
  searchBreweryIf: SearchBreweryIf
}

function SearchBreweryWithNavi (props: Props): JSX.Element {
  const navigate = useNavigate()
  return (
    <SearchBrewery
      searchBreweryIf={props.searchBreweryIf}
      select={(brewery) => {
        navigate(`/breweries/${brewery.id}`)
      }} />
  )
}

export default SearchBreweryWithNavi
