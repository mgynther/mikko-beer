import { useNavigate } from 'react-router-dom'

import SearchBeer from './SearchBeer'

function SearchBeerWithNavi (): JSX.Element {
  const navigate = useNavigate()
  return (
    <SearchBeer select={(beer) => {
      navigate(`/beers/${beer.id}`)
    }} />
  )
}

export default SearchBeerWithNavi
