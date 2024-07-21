import { type ReviewContainerIf } from '../../core/review/types'

import { Role } from '../../core/user/types'

import CreateStorage from './CreateStorage'
import StorageList from './StorageList'

import type { SelectBeerIf } from '../../core/beer/types'
import type { GetLogin, Login } from '../../core/login/types'
import type {
  CreateStorageIf,
  ListStoragesIf
} from '../../core/storage/types'

interface Props {
  getLogin: GetLogin
  listStoragesIf: ListStoragesIf
  selectBeerIf: SelectBeerIf
  createStorageIf: CreateStorageIf
  reviewContainerIf: ReviewContainerIf
}

function Storages (props: Props): JSX.Element {
  const { storages, isLoading } = props.listStoragesIf.useList()
  const login: Login = props.getLogin()
  const isAdmin = login?.user?.role === Role.admin

  const storageItems = storages === undefined
    ? []
    : [...storages.storages]

  return (
    <div>
      <h3>Storage beers</h3>
      <StorageList
        getLogin={props.getLogin}
        isLoading={isLoading}
        isTitleVisible={false}
        storages={storageItems}
      />
      <hr/>
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
