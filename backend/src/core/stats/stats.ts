import { ajv } from '../ajv'

import { type ListDirection, directionValidation } from '../list'

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

type BreweryStatsOrderProperty = 'average' | 'brewery_name' | 'count'

export interface BreweryStatsOrder {
  property: BreweryStatsOrderProperty
  direction: ListDirection
}

export interface OverallStats {
  beerCount: string
  breweryCount: string
  containerCount: string
  distinctBeerReviewCount: string
  reviewAverage: string
  reviewCount: string
  styleCount: string
}

export type RatingStats = Array<{
  rating: string
  count: string
}>

export interface StatsBreweryFilter {
  brewery: string
}

export interface StatsFilter {
  brewery: string | undefined
  minReviewCount: number
}

export type StyleStats = Array<{
  reviewAverage: string
  reviewCount: string
  styleId: string
  styleName: string
}>

type StyleStatsOrderProperty = 'average' | 'style_name' | 'count'

export interface StyleStatsOrder {
  property: StyleStatsOrderProperty
  direction: ListDirection
}

export function validateStatsBreweryFilter (
  query: Record<string, unknown> | undefined
): StatsBreweryFilter | undefined {
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

export function validateStatsFilter (
  query: Record<string, unknown> | undefined
): StatsFilter {
  let defaultFilter: StatsFilter = { brewery: undefined, minReviewCount: 1 }
  if (query === undefined) {
    return defaultFilter
  }
  const breweryFilter = validateStatsBreweryFilter(query)
  defaultFilter = { brewery: breweryFilter?.brewery, minReviewCount: 1 }
  const { min_review_count } = query
  if (min_review_count === undefined) {
    return defaultFilter
  }
  if (typeof min_review_count === 'string' && min_review_count.length > 0) {
    const minReviewCount = parseInt(min_review_count)
    if (isNaN(minReviewCount) || minReviewCount < 1) {
      return defaultFilter
    }
    return {
      brewery: breweryFilter?.brewery,
      minReviewCount
    }
  }
  return defaultFilter
}

const doValidateBreweryStatsOrder =
  ajv.compile<BreweryStatsOrder>({
    type: 'object',
    properties: {
      property: {
        enum: ['average', 'brewery_name', 'count']
      },
      direction: directionValidation
    },
    required: ['property', 'direction'],
    additionalProperties: false
  })

function validateBreweryStatsOrder (body: unknown): boolean {
  return doValidateBreweryStatsOrder(body) as boolean
}

const doValidateStyleStatsOrder =
  ajv.compile<StyleStatsOrder>({
    type: 'object',
    properties: {
      property: {
        enum: ['average', 'style_name', 'count']
      },
      direction: directionValidation
    },
    required: ['property', 'direction'],
    additionalProperties: false
  })

function validateStyleStatsOrder (body: unknown): boolean {
  return doValidateStyleStatsOrder(body) as boolean
}

interface ReviewListOrderParams {
  property: unknown
  direction: unknown
}

function breweryStatsParamsOrDefaults (
  query: Record<string, unknown>
): ReviewListOrderParams {
  let { order, direction } = query
  if (order === undefined || order === '') {
    order = 'brewery_name'
  }
  if (direction === undefined || direction === '') {
    direction = 'asc'
  }
  return { property: order, direction }
}

export function validBreweryStatsOrder (
  query: Record<string, unknown>
): BreweryStatsOrder | undefined {
  const params = breweryStatsParamsOrDefaults(query)
  if (validateBreweryStatsOrder(params)) {
    return {
      property: params.property as BreweryStatsOrderProperty,
      direction: params.direction as ListDirection
    }
  }
  return undefined
}

function styleStatsParamsOrDefaults (
  query: Record<string, unknown>
): ReviewListOrderParams {
  let { order, direction } = query
  if (order === undefined || order === '') {
    order = 'style_name'
  }
  if (direction === undefined || direction === '') {
    direction = 'asc'
  }
  return { property: order, direction }
}

export function validStyleStatsOrder (
  query: Record<string, unknown>
): StyleStatsOrder | undefined {
  const params = styleStatsParamsOrDefaults(query)
  if (validateStyleStatsOrder(params)) {
    return {
      property: params.property as StyleStatsOrderProperty,
      direction: params.direction as ListDirection
    }
  }
  return undefined
}
