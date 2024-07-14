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

export enum StorageTags {
  Storage = 'Storage'
}

export function storageTagTypes (): string[] {
  return [StorageTags.Storage]
}
