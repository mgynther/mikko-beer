export type AnnualStats = Array<{
  reviewAverage: string
  reviewCount: string
  year: string
}>

export type BreweryStats = Array<{
  reviewAverage: string
  reviewCount: string
  breweryId: string
  breweryName: string
}>

export interface OverallStats {
  beerCount: string
  breweryCount: string
  containerCount: string
  reviewAverage: string
  reviewCount: string
  styleCount: string
}

export type RatingStats = Array<{
  rating: string
  count: string
}>

export interface StatsFilter {
  brewery: string
}

export type StyleStats = Array<{
  reviewAverage: string
  reviewCount: string
  styleId: string
  styleName: string
}>

export function validateStatsFilter (
  query: Record<string, unknown> | undefined
): StatsFilter | undefined {
  if (query === undefined) {
    return undefined
  }
  const { brewery } = query
  if (brewery === undefined) {
    return undefined
  }
  if (typeof brewery === 'string' && brewery.length > 0) {
    return { brewery }
  }
  return undefined
}
