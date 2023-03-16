import { type Brewery, type BreweryList, type BreweryMap } from './types'

export function toBreweryMap (list: BreweryList | undefined): BreweryMap {
  if (list === undefined) return {}

  const breweryMap: Record<string, Brewery> = {}
  list.breweries.forEach(brewery => {
    breweryMap[brewery.id] = brewery
  })
  return breweryMap
}
