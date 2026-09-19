import React from 'react'

import type { ReviewContainerIf } from '../types/review/types'

import type { SelectBeerIf } from '../types/beer/types'
import type { GetLogin, Login } from '../types/login/types'
import type {
  CreateStorageIf,
  ListStoragesIf,
  StorageStatsIf,
} from '../types/storage/types'
import { Role } from '../types/user/types'

import CreateStorage from '../internal/storage/CreateStorage'
import StorageList from '../internal/storage/StorageList'
import { countText } from '../internal/storage/count-text'
import Stats from '../internal/storage/Stats'
import type { LinkComponent } from '../common/link'

interface Props {
  linkComponent: LinkComponent
  getLogin: GetLogin
  listStoragesIf: ListStoragesIf
  selectBeerIf: SelectBeerIf
  createStorageIf: CreateStorageIf
  reviewContainerIf: ReviewContainerIf
  statsIf: StorageStatsIf
}

function Storages(props: Props): React.JSX.Element {
  const { storages, isLoading } = props.listStoragesIf.useList()
  const login: Login = props.getLogin()
  const isAdmin = login.user?.role === Role.admin

  const storageItems = storages === undefined ? [] : [...storages.storages]
  const title =
    storages === undefined
      ? 'Storage beers'
      : `Storage beers (${countText(storageItems)})`

  return (
    <div>
      <h3>{title}</h3>
      <StorageList
        linkComponent={props.linkComponent}
        deleteStorageIf={props.listStoragesIf.delete}
        isLoading={isLoading}
        isTitleVisible={false}
        storages={storageItems}
      />
      <Stats statsIf={props.statsIf} />
      <hr />
      {isAdmin && (
        <div>
          <CreateStorage
            selectBeerIf={props.selectBeerIf}
            createStorageIf={props.createStorageIf}
            reviewContainerIf={props.reviewContainerIf}
          />
        </div>
      )}
    </div>
  )
}

export default Storages
