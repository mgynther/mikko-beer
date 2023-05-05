export interface OverallStats {
  beerCount: string
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
  Overall = 'Overall',
  Style = 'Style'
}

export function allStatsTagTypes (): string[] {
  return [StatsTags.Annual, StatsTags.Overall, StatsTags.Style]
}

export function beerStatsTagTypes (): string[] {
  return [StatsTags.Overall, StatsTags.Style]
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
