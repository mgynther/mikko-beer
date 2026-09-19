import React from 'react'

import type { ListStoragesByIf } from '../../types/storage/types'
import StorageList from '../storage/StorageList'
import type { LinkComponent } from '../../common/link'

interface Props {
  linkComponent: LinkComponent
  beerId: string
  listStoragesByBeerIf: ListStoragesByIf
}

const BeerStorages = (props: Props): React.JSX.Element => {
  const { storages, isLoading } = props.listStoragesByBeerIf.useList(
    props.beerId,
  )
  const storageList = storages?.storages ?? []
  return (
    <>
      {storageList.length > 0 && (
        <StorageList
          linkComponent={props.linkComponent}
          deleteStorageIf={props.listStoragesByBeerIf.delete}
          isLoading={isLoading}
          isTitleVisible={true}
          storages={storageList}
        />
      )}
    </>
  )
}

export default BeerStorages
