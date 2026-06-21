import React from 'react'

import type { ListStoragesByIf } from '../../core/storage/types'
import StorageList from '../storage/StorageList'

interface Props {
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
