import React from 'react'

import type { ListStoragesByIf } from '../../types/storage/types'
import StorageList from '../storage/StorageList'
import type { LinkComponent } from '../../common/link'

interface Props {
  linkComponent: LinkComponent
  breweryId: string
  listStoragesByBreweryIf: ListStoragesByIf
}

const BreweryStorages = (props: Props): React.JSX.Element => {
  const { storages, isLoading } = props.listStoragesByBreweryIf.useList(
    props.breweryId,
  )
  const storageList = storages?.storages ?? []
  return (
    <>
      {storageList.length > 0 && (
        <StorageList
          linkComponent={props.linkComponent}
          deleteStorageIf={props.listStoragesByBreweryIf.delete}
          isLoading={isLoading}
          isTitleVisible={true}
          storages={storageList}
        />
      )}
    </>
  )
}

export default BreweryStorages
