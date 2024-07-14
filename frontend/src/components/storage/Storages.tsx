import { type ReviewContainerIf } from '../../core/review/types'
import { useSelector } from '../../react-redux-wrapper'

import { type Login, selectLogin } from '../../store/login/reducer'
import { useListStoragesQuery } from '../../store/storage/api'
import { Role } from '../../core/user/types'

import CreateStorage from './CreateStorage'
import StorageList from './StorageList'
import type { SelectStyleIf } from '../../core/style/types'

interface Props {
  selectStyleIf: SelectStyleIf
  reviewContainerIf: ReviewContainerIf
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
            selectStyleIf={props.selectStyleIf}
            reviewContainerIf={props.reviewContainerIf}
          />
        </div>
      )}
    </div>
  )
}

export default Storages
