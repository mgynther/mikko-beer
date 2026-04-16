import React from 'react'

import type { ReviewContainerIf } from '../../core/review/types'

import type { SelectBeerIf } from '../../core/beer/types'
import type { GetLogin, Login } from '../../core/login/types'
import type { SearchIf } from '../../core/search/types'
import type {
  CreateStorageIf,
  ListStoragesIf,
  StorageStatsIf,
} from '../../core/storage/types'
import { Role } from '../../core/user/types'

import CreateStorage from './CreateStorage'
import StorageList from './StorageList'
import { countText } from './count-text'
import Stats from './Stats'
import type { ParamsIf } from '../util'

interface Props {
  getLogin: GetLogin
  listStoragesIf: ListStoragesIf
  searchIf: SearchIf
  selectBeerIf: SelectBeerIf
  createStorageIf: CreateStorageIf
  reviewContainerIf: ReviewContainerIf
  paramsIf: ParamsIf
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
        deleteStorageIf={props.listStoragesIf.delete}
        getLogin={props.getLogin}
        isLoading={isLoading}
        isTitleVisible={false}
        storages={storageItems}
      />
      <Stats statsIf={props.statsIf} paramsIf={props.paramsIf} />
      <hr />
      {isAdmin && (
        <div>
          <CreateStorage
            searchIf={props.searchIf}
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
