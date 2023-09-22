import { Link } from 'react-router-dom'

import { useListStoragesQuery } from '../../store/storage/api'
import { type Storage } from '../../store/storage/types'

import LoadingIndicator from '../common/LoadingIndicator'
import { formatBestBefore, joinSortedNames } from '../util'

import CreateStorage from './CreateStorage'

import './Storages.css'

function Storages (): JSX.Element {
  const { data: storageData, isLoading } = useListStoragesQuery()

  const storages = storageData?.storages === undefined
    ? []
    : [...storageData.storages]

  return (
    <div>
      <h3>Storage beers</h3>
      <LoadingIndicator isLoading={isLoading} />
      <div className='StorageHeading'>
          <div className='BeerName'>Name</div>
          <div className='BeerBreweries'>Breweries</div>
          <div className='BeerStyles'>Styles</div>
          <div className='BestBefore'>Best before</div>
          <div className='ReviewLink'></div>
      </div>
      {storages.map((storage: Storage) => (
        <div className='StorageRow RowLike' key={storage.id}>
          <div className='BeerName'>{storage.beerName}</div>
          <div className='BeerBreweries'>
            {joinSortedNames(storage.breweries)}
          </div>
         <div className='BeerStyles'>
            {joinSortedNames(storage.styles)}
          </div>
          <div className='BestBefore'>
            {formatBestBefore(storage.bestBefore)}
          </div>
          <div className='ReviewLink'>
            <Link to={`/addreview/${storage.id}`}>Review</Link>
          </div>
        </div>
      ))}
      <hr/>
      <div>
        <CreateStorage />
      </div>
    </div>
  )
}

export default Storages
