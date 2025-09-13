import { useState } from 'react'

import { Link } from '../common/Link'

import type { DeleteStorageIf, Storage } from '../../core/storage/types'
import type {
  GetLogin,
  Login
} from '../../core/login/types'
import { Role } from '../../core/user/types'
import { formatDateString } from '../util'

import BeerLink from '../beer/BeerLink'
import BreweryLinks from '../brewery/BreweryLinks'
import Button from '../common/Button'
import LinkLikeButton from '../common/LinkLikeButton'
import StyleLinks from '../style/StyleLinks'

import './StorageList.css'
import ContainerInfo from '../container/ContainerInfo'

interface Props {
  deleteStorageIf: DeleteStorageIf
  // Giving confirm loses context and results in illegal invocation when used.
  getConfirm: () => (text: string) => boolean
  getLogin: GetLogin
  storage: Storage
}

function StorageItem (props: Props): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const login: Login = props.getLogin()
  const isAdmin = login.user?.role === Role.admin
  const { storage } = props
  const del = props.deleteStorageIf.useDelete().delete

  function getOpenSymbol (isOpen: boolean): string {
    return isOpen ? 'Close ▲' : 'Open ▼'
  }

  async function confirmDeleteStorage (storage: Storage): Promise<void> {
    const confirmText = `Are you sure you want to delete "${storage.beerName}"?`
    if (props.getConfirm()(confirmText)) {
      await del(storage.id)
    }
  }

  return (
    <div className='StorageRow RowLike'>
      <div className='StorageItem-primary-row'>
        <div className='BeerBreweries'>
          <BreweryLinks breweries={storage.breweries} />
        </div>
        <div className='BeerName'>
          <BeerLink beer={{
            id: storage.beerId,
            name: storage.beerName
          }}/ >{storage.hasReview ? ' *' : null}
        </div>
        <div className='BeerStyles'>
          <StyleLinks styles={storage.styles} />
        </div>
        <div className='BestBefore'>
          {formatDateString(storage.bestBefore)}
        </div>
        <div className='Actions'>
          <Button
            className='TabButton Compact'
            onClick={() => { setIsOpen(!isOpen); }}
            text={getOpenSymbol(isOpen)}
          />
        </div>
      </div>
      {isOpen && (
        <div className='StorageItem-secondary-row'>
          <ContainerInfo container={storage.container} />
          <div>
            Added on {formatDateString(storage.createdAt)}
          </div>
          {isAdmin && (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default StorageItem
