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

export interface StatsBreweryStyleFilter {
  brewery: string | undefined
  style: string | undefined
}

export interface StatsFilter {
  brewery: string | undefined
  style: string | undefined
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

export function validStatsBreweryStyleFilter (
  query: Record<string, unknown> | undefined
): StatsBreweryStyleFilter | undefined {
  const noFilter = { brewery: undefined, style: undefined }
  if (query === undefined) {
    return noFilter
  }
  const { brewery, style } = query
  const validBrewery = typeof brewery === 'string' && brewery.length > 0
    ? brewery
    : undefined
  const validStyle = typeof style === 'string' && style.length > 0
    ? style
    : undefined
  if (validBrewery !== undefined && validStyle !== undefined) {
    // Both are not supported as it's currently not a valid use case and
    // queries are not trivial.
    return undefined
  }
  return {
    brewery: validBrewery,
    style: validStyle
  }
}

export function validateStatsFilter (
  query: Record<string, unknown> | undefined
): StatsFilter {
  const result: StatsFilter = {
    brewery: undefined,
    style: undefined,
    maxReviewAverage: 10,
    minReviewAverage: 4,
    maxReviewCount: Infinity,
    minReviewCount: 1
  }
  if (query === undefined) {
    return result
  }
  const breweryFilter = validStatsBreweryStyleFilter(query)
  if (breweryFilter === undefined) {
    return result
  }
  result.brewery = breweryFilter.brewery
  result.style = breweryFilter.style
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
  return doValidateBreweryStatsOrder(body)
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
  return doValidateStyleStatsOrder(body)
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
