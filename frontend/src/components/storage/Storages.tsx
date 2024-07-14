import {
  type CreateContainerIf,
  type ListContainersIf
} from '../../core/container/types'
import { useSelector } from '../../react-redux-wrapper'

import { type Login, selectLogin } from '../../store/login/reducer'
import { useListStoragesQuery } from '../../store/storage/api'
import { Role } from '../../store/user/types'

import CreateStorage from './CreateStorage'
import StorageList from './StorageList'

interface Props {
  createContainerIf: CreateContainerIf
  listContainersIf: ListContainersIf
}

function Storages (props: Props): JSX.Element {
  const { data: storageData, isLoading } = useListStoragesQuery()
  const login: Login = useSelector(selectLogin)
  const isAdmin = login?.user?.role === Role.admin

  const storages = storageData?.storages === undefined
    ? []
    : [...storageData.storages]

  return (
    <div>
      <h3>Storage beers</h3>
      <StorageList
        isLoading={isLoading}
        isTitleVisible={false}
        storages={storages}
      />
      <hr/>
      {isAdmin && (
        <div>
          <CreateStorage
            createContainerIf={props.createContainerIf}
            listContainersIf={props.listContainersIf}
            />
        </div>
      )}
    </div>
  )
}

export default Storages
