import { Link } from '../common/Link'

import { type Storage } from '../../core/storage/types'
import { Role } from '../../core/user/types'

import BeerLink from '../beer/BeerLink'
import BreweryLinks from '../brewery/BreweryLinks'
import LoadingIndicator from '../common/LoadingIndicator'
import StyleLinks from '../style/StyleLinks'
import { formatBestBefore } from '../util'

import './StorageList.css'
import type {
  GetLogin,
  Login
} from '../../core/login/types'

interface Props {
  getLogin: GetLogin
  isLoading: boolean
  isTitleVisible: boolean
  storages: Storage[]
}

function StorageList (props: Props): JSX.Element {
  const login: Login = props.getLogin()
  const isAdmin = login?.user?.role === Role.admin

  return (
    <div>
      {props.isTitleVisible && <h4>Storage {`(${props.storages.length})`}</h4>}
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
            <StyleLinks styles={storage.styles} />
          </div>
          <div className='BestBefore'>
            {formatBestBefore(storage.bestBefore)}
          </div>
          {isAdmin && (
            <div className='ReviewLink'>
              <Link
                to={`/addreview/${storage.id}`}
                text="Review"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default StorageList
