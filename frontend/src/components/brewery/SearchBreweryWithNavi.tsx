import { useNavigate } from 'react-router-dom'

import SearchBrewery from './SearchBrewery'

function SearchBreweryWithNavi (): JSX.Element {
  const navigate = useNavigate()
  return (
    <SearchBrewery select={(brewery) => {
      navigate(`/breweries/${brewery.id}`)
    }} />
  )
}

export default SearchBreweryWithNavi
