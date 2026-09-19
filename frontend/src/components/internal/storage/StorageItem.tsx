import { useState } from 'react'

import type { DeleteStorageIf, Storage } from '../../types/storage/types'
import type { Login } from '../../types/login/types'
import type { Confirm } from '../confirm'
import { Role } from '../../types/user/types'
import { formatDateString } from '../../util'

import BeerLink from '../beer/BeerLink'
import BreweryLinks from '../brewery/BreweryLinks'
import Button from '../common/Button'
import LinkLikeButton from '../common/LinkLikeButton'
import StyleLinks from '../style/StyleLinks'

import './StorageList.css'
import ContainerInfo from '../container/ContainerInfo'
import type { LinkComponent } from '../../common/link'

interface Props {
  linkComponent: LinkComponent
  deleteStorageIf: DeleteStorageIf
  confirm: Confirm
  storage: Storage
}

function StorageItem(props: Props): React.JSX.Element {
  const Link = props.linkComponent
  const [isOpen, setIsOpen] = useState(false)
  const login: Login = props.deleteStorageIf.getLogin()
  const isAdmin = login.user?.role === Role.admin
  const { storage } = props
  const del = props.deleteStorageIf.useDelete().delete

  function getOpenSymbol(isOpen: boolean): string {
    return isOpen ? 'Close ▲' : 'Open ▼'
  }

  async function confirmDeleteStorage(storage: Storage): Promise<void> {
    const confirmText = `Are you sure you want to delete "${storage.beerName}"?`
    if (props.confirm(confirmText)) {
      await del(storage.id)
    }
  }

  return (
    <div className='StorageRow RowLike'>
      <div className='StorageItem-primary-row'>
        <div className='BeerBreweries'>
          <BreweryLinks
            linkComponent={props.linkComponent}
            breweries={storage.breweries}
          />
        </div>
        <div className='BeerName'>
          <BeerLink
            linkComponent={props.linkComponent}
            beer={{
              id: storage.beerId,
              name: storage.beerName,
            }}
          />
          {storage.hasReview ? ' *' : null}
        </div>
        <div className='BeerStyles'>
          <StyleLinks
            linkComponent={props.linkComponent}
            styles={storage.styles}
          />
        </div>
        <div className='BestBefore'>{formatDateString(storage.bestBefore)}</div>
        <div className='Actions'>
          <Button
            className='TabButton Compact'
            onClick={() => {
              setIsOpen(!isOpen)
            }}
            text={getOpenSymbol(isOpen)}
          />
        </div>
      </div>
      {isOpen && (
        <div className='StorageItem-secondary-row'>
          <ContainerInfo container={storage.container} />
          <div>Added on {formatDateString(storage.createdAt)}</div>
          {isAdmin && (
            <>
              <div>
                <Link to={`/addreview/${storage.id}`} text='Review' />
              </div>
              <div>
                <LinkLikeButton
                  onClick={() => {
                    void confirmDeleteStorage(storage)
                  }}
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
