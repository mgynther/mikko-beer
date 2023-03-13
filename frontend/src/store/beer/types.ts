export interface Beer {
  id: string
  name: string
}

export interface BeerList {
  beers: Beer[]
}

export enum BeerTags {
  Beer = 'Beer'
}

export function beerTagTypes(): string[] {
  return [ BeerTags.Beer ]
}
