import React from 'react'

import type { DeleteStorageIf, Storage } from '../../core/storage/types'

import LoadingIndicator from '../common/LoadingIndicator'
import StorageItem from './StorageItem'

import './StorageList.css'
import type { GetLogin } from '../../core/login/types'

interface Props {
  deleteStorageIf: DeleteStorageIf
  getLogin: GetLogin
  isLoading: boolean
  isTitleVisible: boolean
  storages: Storage[]
}

function StorageList (props: Props): React.JSX.Element {
  return (
    <div>
      {props.isTitleVisible && <h4>Storage {`(${props.storages.length})`}</h4>}
      <LoadingIndicator isLoading={props.isLoading} />
      <div className='StorageHeading'>
          <div className='BeerBreweries'>Breweries</div>
          <div className='BeerName'>Beer name (reviewed *)</div>
          <div className='BeerStyles'>Styles</div>
          <div className='BestBefore'>Best before</div>
          <div className='Actions'></div>
      </div>
      {props.storages.map((storage: Storage) => (
        <StorageItem
          key={storage.id}
          deleteStorageIf={props.deleteStorageIf}
          getConfirm={() => confirm}
          getLogin={props.getLogin}
          storage={storage}
        />
      ))}
    </div>
  )
}

export default StorageList
