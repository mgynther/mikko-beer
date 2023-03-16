export interface Brewery {
  id: string
  name: string
}

export type BreweryMap = Record<string, Brewery>

export interface BreweryList {
  breweries: Brewery[]
}

export enum BreweryTags {
  Brewery = 'Brewery'
}

export function breweryTagTypes (): string[] {
  return [BreweryTags.Brewery]
}
