export interface Beer {
  id: string
  name: string
  breweries: string[]
  styles: string[]
}

export type BeerMap = Record<string, Beer>

export interface BeerList {
  beers: Beer[]
}

export enum BeerTags {
  Beer = 'Beer'
}

export function beerTagTypes (): string[] {
  return [BeerTags.Beer]
}