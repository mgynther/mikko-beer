import { type Brewery } from '../brewery/types'
import { type Style } from '../style/types'

export interface Beer {
  id: string
  name: string
  breweries: Brewery[]
  styles: Style[]
}

export interface BeerWithIds {
  id: string
  name: string
  breweries: string[]
  styles: string[]
}

export interface BeerList {
  beers: Beer[]
}

export interface GetBeerIf {
  useGetBeer: (beerId: string) => {
    beer: Beer | undefined
    isLoading: boolean
  }
}
