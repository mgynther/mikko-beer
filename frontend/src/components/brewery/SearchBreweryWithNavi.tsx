import SearchBrewery from './SearchBrewery'
import type { SearchBreweryIf } from '../../core/brewery/types'
import type { SearchIf } from '../../core/search/types'
import type { NavigateIf } from '../util'

export interface Props {
  navigateIf: NavigateIf
  searchIf: SearchIf
  searchBreweryIf: SearchBreweryIf
}

function SearchBreweryWithNavi (props: Props): JSX.Element {
  const navigate = props.navigateIf.useNavigate()
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
