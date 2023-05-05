export type AnnualStats = Array<{
  reviewAverage: string
  reviewCount: string
  year: string
}>

export interface OverallStats {
  beerCount: string
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
