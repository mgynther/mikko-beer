import { type Brewery } from '../brewery/types'
import { type Container } from '../../core/container/types'
import { type Style } from '../style/types'

export interface Storage {
  id: string
  beerId: string
  beerName: string
  bestBefore: string
  breweries: Brewery[]
  container: Container
  styles: Style[]
}

export interface StorageList {
  storages: Storage[]
}
