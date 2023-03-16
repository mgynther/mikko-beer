import { type Beer, type BeerList, type BeerMap } from './types'

export function toBeerMap (list: BeerList | undefined): BeerMap {
  if (list === undefined) return {}

  const beerMap: Record<string, Beer> = {}
  list.beers.forEach(beer => {
    beerMap[beer.id] = beer
  })
  return beerMap
}
