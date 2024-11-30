import React from 'react'

import type { GetLogin } from "../../core/login/types"
import type { ListStoragesByIf } from "../../core/storage/types"
import StorageList from "../storage/StorageList"

interface Props {
  breweryId: string
  listStoragesByBreweryIf: ListStoragesByIf
  getLogin: GetLogin
}

const BreweryStorages = (props: Props): React.JSX.Element => {
  const { storages, isLoading } =
    props.listStoragesByBreweryIf.useList(props.breweryId)
  return <>
    {(storages?.storages ?? []).length > 0 && (
      <StorageList
        getLogin={props.getLogin}
        isLoading={isLoading}
        isTitleVisible={true}
        storages={storages?.storages ?? []}
      />
    )}
  </>
}

export default BreweryStorages
