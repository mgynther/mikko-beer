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

interface ReviewListOrderParams {
  property: unknown
  direction: unknown
}

function reviewListOrderParamsOrDefaults (
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
  const params =
    reviewListOrderParamsOrDefaults(query)
  if (validateBreweryStatsOrder(params)) {
    return {
      property: params.property as BreweryStatsOrderProperty,
      direction: params.direction as ListDirection
    }
  }
  return undefined
}
