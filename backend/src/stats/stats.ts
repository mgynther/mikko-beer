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

export type StyleStats = Array<{
  reviewAverage: string
  reviewCount: string
  styleId: string
  styleName: string
}>
