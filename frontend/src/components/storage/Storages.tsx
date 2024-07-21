import { type ReviewContainerIf } from '../../core/review/types'

import { useListStoragesQuery } from '../../store/storage/api'
import { Role } from '../../core/user/types'

import CreateStorage from './CreateStorage'
import StorageList from './StorageList'

import type { SelectBeerIf } from '../../core/beer/types'
import type { GetLogin, Login } from '../../core/login/types'
import type { CreateStorageIf } from '../../core/storage/types'

interface Props {
  getLogin: GetLogin
  selectBeerIf: SelectBeerIf
  createStorageIf: CreateStorageIf
  reviewContainerIf: ReviewContainerIf
}

function Storages (props: Props): JSX.Element {
  const { data: storageData, isLoading } = useListStoragesQuery()
  const login: Login = props.getLogin()
  const isAdmin = login?.user?.role === Role.admin

  const storages = storageData?.storages === undefined
    ? []
    : [...storageData.storages]

  return (
    <div>
      <h3>Storage beers</h3>
      <StorageList
        getLogin={props.getLogin}
        isLoading={isLoading}
        isTitleVisible={false}
        storages={storages}
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
