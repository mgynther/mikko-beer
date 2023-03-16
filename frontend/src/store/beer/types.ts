export interface Beer {
  id: string
  name: string
  breweries: string[]
  styles: string[]
}

export interface BeerList {
  beers: Beer[]
}

export enum BeerTags {
  Beer = 'Beer'
}

export function beerTagTypes (): string[] {
  return [BeerTags.Beer]
}
