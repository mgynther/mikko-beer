import { type ListDirection } from '../types'

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

export type BreweryStatsSortingOrder = 'average' | 'brewery_name' | 'count'

export interface BreweryStatsSorting {
  order: BreweryStatsSortingOrder
  direction: ListDirection
}

export interface RatingStats {
  rating: Array<{
    rating: string
    count: string
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

export type StyleStatsSortingOrder = 'average' | 'style_name' | 'count'

export interface StyleStatsSorting {
  order: StyleStatsSortingOrder
  direction: ListDirection
}

export enum StatsTags {
  Annual = 'Annual',
  Brewery = 'Brewery',
  Overall = 'Overall',
  Rating = 'Rating',
  Style = 'Style'
}

export function allStatsTagTypes (): string[] {
  return [
    StatsTags.Annual,
    StatsTags.Brewery,
    StatsTags.Overall,
    StatsTags.Rating,
    StatsTags.Style
  ]
}

export function beerStatsTagTypes (): string[] {
  return [StatsTags.Overall, StatsTags.Brewery, StatsTags.Style]
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
