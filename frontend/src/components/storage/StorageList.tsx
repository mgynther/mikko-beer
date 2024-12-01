import React from 'react'

import { Link } from '../common/Link'

import type { DeleteStorageIf, Storage } from '../../core/storage/types'
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
import LinkLikeButton from '../common/LinkLikeButton'

interface Props {
  deleteStorageIf: DeleteStorageIf
  // Giving confirm loses context and results in illegal invocation when used.
  getConfirm: () => (text: string) => boolean
  getLogin: GetLogin
  isLoading: boolean
  isTitleVisible: boolean
  storages: Storage[]
}

function StorageList (props: Props): React.JSX.Element {
  const login: Login = props.getLogin()
  const isAdmin = login.user?.role === Role.admin
  const del = props.deleteStorageIf.useDelete().delete

  async function confirmDeleteStorage (storage: Storage): Promise<void> {
    const confirmText = `Are you sure you want to delete "${storage.beerName}"?`
    if (props.getConfirm()(confirmText)) {
      await del(storage.id)
    }
  }

  return (
    <div>
      {props.isTitleVisible && <h4>Storage {`(${props.storages.length})`}</h4>}
      <LoadingIndicator isLoading={props.isLoading} />
      <div className='StorageHeading'>
          <div className='BeerBreweries'>Breweries</div>
          <div className='BeerName'>Beer name</div>
          <div className='BeerStyles'>Styles</div>
          <div className='BestBefore'>Best before</div>
          {isAdmin && <div className='Actions'></div>}
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
            <div className='Actions'>
              <div>
                <Link
                  to={`/addreview/${storage.id}`}
                  text="Review"
                />
              </div>
              <div>
                <LinkLikeButton
                  onClick={() => { void confirmDeleteStorage(storage); }}
                  text='Delete'
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default StorageList
