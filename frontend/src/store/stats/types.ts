export interface OverallStats {
  beerCount: string
  breweryCount: string
  containerCount: string
  reviewAverage: string
  reviewCount: string
  styleCount: string
}

export interface AnnualStats {
  annual: Array<{
    reviewAverage: string
    reviewCount: string
    year: string
  }>
}

export interface OneBreweryStats {
  breweryId: string
  breweryName: string
  reviewAverage: string
  reviewCount: string
}

export interface BreweryStats {
  brewery: OneBreweryStats[]
}

export interface StyleStats {
  style: Array<{
    reviewAverage: string
    reviewCount: string
    styleId: string
    styleName: string
  }>
}

export enum StatsTags {
  Annual = 'Annual',
  Brewery = 'Brewery',
  Overall = 'Overall',
  Style = 'Style'
}

export function allStatsTagTypes (): string[] {
  return [
    StatsTags.Annual,
    StatsTags.Brewery,
    StatsTags.Overall,
    StatsTags.Style
  ]
}

export function beerStatsTagTypes (): string[] {
  return [StatsTags.Overall, StatsTags.Style]
}

export function breweryStatsTagTypes (): string[] {
  return [StatsTags.Overall, StatsTags.Brewery]
}

export function containerStatsTagTypes (): string[] {
  return [StatsTags.Overall]
}

export function reviewStatsTagTypes (): string[] {
  return allStatsTagTypes()
}

export function styleStatsTagTypes (): string[] {
  return [StatsTags.Overall, StatsTags.Style]
}
