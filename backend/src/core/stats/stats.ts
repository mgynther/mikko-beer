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
  maxReviewCount: number
  minReviewCount: number
  maxReviewAverage: number
  minReviewAverage: number
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
  const result: StatsFilter = {
    brewery: undefined,
    maxReviewAverage: 10,
    minReviewAverage: 4,
    maxReviewCount: Infinity,
    minReviewCount: 1
  }
  if (query === undefined) {
    return result
  }
  const breweryFilter = validateStatsBreweryFilter(query)
  result.brewery = breweryFilter?.brewery
  const {
    min_review_count,
    max_review_count,
    min_review_average,
    max_review_average
  } = query
  type NumberKey =
    'maxReviewAverage' |
    'minReviewAverage' |
    'maxReviewCount' |
    'minReviewCount'
  function assignValid (
    key: NumberKey,
    value: unknown,
    validator: (value: number) => boolean,
    parser: (valud: string) => number
  ): void {
    if (typeof value === 'string' && value.length > 0) {
      const numValue = parser(value)
      if (!isNaN(numValue) && validator(numValue)) {
        result[key] = numValue
      }
    }
  }
  const validateAverage = (value: number): boolean => value <= 10 && value >= 4
  const validateCount =
    (value: number): boolean => value <= Infinity && value >= 1
  assignValid(
    'maxReviewAverage', max_review_average, validateAverage, parseFloat)
  assignValid(
    'minReviewAverage', min_review_average, validateAverage, parseFloat)
  assignValid('maxReviewCount', max_review_count, validateCount, parseInt)
  assignValid('minReviewCount', min_review_count, validateCount, parseInt)
  return result
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
