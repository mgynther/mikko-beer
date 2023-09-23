import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { type Login, selectLogin } from '../../store/login/reducer'
import { type Storage } from '../../store/storage/types'
import { Role } from '../../store/user/types'

import BeerLink from '../beer/BeerLink'
import BreweryLinks from '../brewery/BreweryLinks'
import LoadingIndicator from '../common/LoadingIndicator'
import { formatBestBefore, joinSortedNames } from '../util'

import './StorageList.css'

interface Props {
  isLoading: boolean
  storages: Storage[]
}

function StorageList (props: Props): JSX.Element {
  const login: Login = useSelector(selectLogin)
  const isAdmin = login?.user?.role === Role.admin

  return (
    <div>
      <LoadingIndicator isLoading={props.isLoading} />
      <div className='StorageHeading'>
          <div className='BeerBreweries'>Breweries</div>
          <div className='BeerName'>Beer name</div>
          <div className='BeerStyles'>Styles</div>
          <div className='BestBefore'>Best before</div>
          {isAdmin && <div className='ReviewLink'></div>}
      </div>
      {props.storages.map((storage: Storage) => (
        <div className='StorageRow RowLike' key={storage.id}>
          <div className='BeerBreweries'>
            <BreweryLinks breweries={storage.breweries} />
          </div>
          <div className='BeerName'>
            <BeerLink beer={{
              id: storage.beerId,
              name: storage.beerName
            }}/ >
          </div>
          <div className='BeerStyles'>
            {joinSortedNames(storage.styles)}
          </div>
          <div className='BestBefore'>
            {formatBestBefore(storage.bestBefore)}
          </div>
          {isAdmin && (
            <div className='ReviewLink'>
              <Link to={`/addreview/${storage.id}`}>Review</Link>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default StorageList
