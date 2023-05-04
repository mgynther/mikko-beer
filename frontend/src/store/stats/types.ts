export interface Stats {
  beerCount: string
  containerCount: string
  reviewAverage: string
  reviewCount: string
  styleCount: string
  annual: Array<{
    reviewAverage: string
    reviewCount: string
    year: string
  }>
  styles: Array<{
    reviewAverage: string
    reviewCount: string
    styleId: string
    styleName: string
  }>
}

export enum StatsTags {
  Stats = 'Stats'
}

export function statsTagTypes (): string[] {
  return [StatsTags.Stats]
}
