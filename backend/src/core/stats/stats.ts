import { ajv } from '../internal/ajv.js'

import {
  invalidIdFilterError,
  invalidBreweryStatsQueryError,
  invalidLocationStatsQueryError,
  invalidStyleStatsQueryError,
} from '../errors.js'
import type { ListDirection } from '../list.js'
import { directionValidation } from '../internal/list.js'

export type AnnualStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  year: string
}>

export type AnnualContainerStats = Array<{
  containerId: string
  containerSize: string
  containerType: string
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  year: string
}>

export type BreweryStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  reviewedBeerCount: string
  breweryId: string
  breweryName: string
}>

export type ContainerStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  containerId: string
  containerSize: string
  containerType: string
}>

export type LocationStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  locationId: string
  locationName: string
}>

type BreweryStatsOrderProperty = 'average' | 'brewery_name' | 'count'

export interface BreweryStatsOrder {
  property: BreweryStatsOrderProperty
  direction: ListDirection
}

type LocationStatsOrderProperty = 'average' | 'location_name' | 'count'

export interface LocationStatsOrder {
  property: LocationStatsOrderProperty
  direction: ListDirection
}

export interface OverallStats {
  beerCount: string
  breweryCount: string
  containerCount: string
  locationCount: string
  distinctBeerReviewCount: string
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  styleCount: string
}

export type RatingStats = Array<{
  rating: string
  count: string
}>

export interface StatsIdFilter {
  brewery: string | undefined
  location: string | undefined
  style: string | undefined
}

export interface StatsFilter {
  brewery: string | undefined
  location: string | undefined
  style: string | undefined
  maxReviewCount: number
  minReviewCount: number
  maxReviewAverage: number
  minReviewAverage: number
  timeStart: Date | undefined
  timeEnd: Date | undefined
}

export type StyleStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  styleId: string
  styleName: string
}>

type StyleStatsOrderProperty = 'average' | 'style_name' | 'count'

export interface StyleStatsOrder {
  property: StyleStatsOrderProperty
  direction: ListDirection
}

function validStatsIdFilter(
  query: Record<string, unknown> | undefined,
): StatsIdFilter | undefined {
  const noFilter = { brewery: undefined, location: undefined, style: undefined }
  if (query === undefined) {
    return noFilter
  }
  const { brewery, location, style } = query
  const validBrewery =
    typeof brewery === 'string' && brewery.length > 0 ? brewery : undefined
  const validLocation =
    typeof location === 'string' && location.length > 0 ? location : undefined
  const validStyle =
    typeof style === 'string' && style.length > 0 ? style : undefined
  const ids = [validBrewery, validLocation, validStyle]
  if (ids.filter((value) => value !== undefined).length > 1) {
    // Multiple are not supported as it's currently not a valid use case and
    // queries are not trivial.
    return undefined
  }
  return {
    brewery: validBrewery,
    location: validLocation,
    style: validStyle,
  }
}

export function validateStatsIdFilter(
  query: Record<string, unknown> | undefined,
): StatsIdFilter {
  const result = validStatsIdFilter(query)
  if (result === undefined) {
    throw invalidIdFilterError
  }
  return result
}

export function validateStatsFilter(
  query: Record<string, unknown> | undefined,
): StatsFilter {
  const defaultResult: StatsFilter = {
    brewery: undefined,
    location: undefined,
    style: undefined,
    maxReviewAverage: 10,
    minReviewAverage: 4,
    maxReviewCount: Infinity,
    minReviewCount: 1,
    timeStart: undefined,
    timeEnd: undefined,
  }
  if (query === undefined) {
    return defaultResult
  }
  const statsIdFilter = validateStatsIdFilter(query)
  const result = {
    ...defaultResult,
    ...statsIdFilter,
  }
  const {
    min_review_count,
    max_review_count,
    min_review_average,
    max_review_average,
    time_start,
    time_end,
  } = query
  type NumberKey =
    | 'maxReviewAverage'
    | 'minReviewAverage'
    | 'maxReviewCount'
    | 'minReviewCount'
  function assignValidNumber(
    key: NumberKey,
    value: unknown,
    validator: (value: number) => boolean,
    parser: (valud: string) => number,
  ): void {
    if (typeof value === 'string' && value.length > 0) {
      const numValue = parser(value)
      if (!isNaN(numValue) && validator(numValue)) {
        result[key] = numValue
      }
    }
  }
  const validateAverage = (value: number): boolean => value <= 10 && value >= 4
  const validateCount = (value: number): boolean =>
    value <= Infinity && value >= 1
  assignValidNumber(
    'maxReviewAverage',
    max_review_average,
    validateAverage,
    parseFloat,
  )
  assignValidNumber(
    'minReviewAverage',
    min_review_average,
    validateAverage,
    parseFloat,
  )
  assignValidNumber('maxReviewCount', max_review_count, validateCount, parseInt)
  assignValidNumber('minReviewCount', min_review_count, validateCount, parseInt)

  const validateTimestamp = (value: number): boolean =>
    value <= Infinity && value >= 1
  function assignValidDate(key: 'timeStart' | 'timeEnd', value: unknown): void {
    if (typeof value === 'string' && value.length > 0) {
      const numValue = parseInt(value)
      if (!isNaN(numValue) && validateTimestamp(numValue)) {
        result[key] = new Date(numValue)
      }
    }
  }
  assignValidDate('timeStart', time_start)
  assignValidDate('timeEnd', time_end)
  return result
}

const doValidateBreweryStatsOrder = ajv.compile<BreweryStatsOrder>({
  type: 'object',
  properties: {
    property: {
      enum: ['average', 'brewery_name', 'count'],
    },
    direction: directionValidation,
  },
  required: ['property', 'direction'],
  additionalProperties: false,
})

function isBreweryStatsOrderValid(body: unknown): boolean {
  return doValidateBreweryStatsOrder(body)
}

const doValidateLocationStatsOrder = ajv.compile<LocationStatsOrder>({
  type: 'object',
  properties: {
    property: {
      enum: ['average', 'location_name', 'count'],
    },
    direction: directionValidation,
  },
  required: ['property', 'direction'],
  additionalProperties: false,
})

function isLocationStatsOrderValid(body: unknown): boolean {
  return doValidateLocationStatsOrder(body)
}

const doValidateStyleStatsOrder = ajv.compile<StyleStatsOrder>({
  type: 'object',
  properties: {
    property: {
      enum: ['average', 'style_name', 'count'],
    },
    direction: directionValidation,
  },
  required: ['property', 'direction'],
  additionalProperties: false,
})

function isStyleStatsOrderValid(body: unknown): boolean {
  return doValidateStyleStatsOrder(body)
}

interface ReviewListOrderParams {
  property: unknown
  direction: unknown
}

function breweryStatsParamsOrDefaults(
  query: Record<string, unknown>,
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

export function validateBreweryStatsOrder(
  query: Record<string, unknown>,
): BreweryStatsOrder {
  const params = breweryStatsParamsOrDefaults(query)
  if (isBreweryStatsOrderValid(params)) {
    return {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      property: params.property as BreweryStatsOrderProperty,
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      direction: params.direction as ListDirection,
    }
  }
  throw invalidBreweryStatsQueryError
}

function locationStatsParamsOrDefaults(
  query: Record<string, unknown>,
): ReviewListOrderParams {
  let { order, direction } = query
  if (order === undefined || order === '') {
    order = 'location_name'
  }
  if (direction === undefined || direction === '') {
    direction = 'asc'
  }
  return { property: order, direction }
}

export function validateLocationStatsOrder(
  query: Record<string, unknown>,
): LocationStatsOrder {
  const params = locationStatsParamsOrDefaults(query)
  if (isLocationStatsOrderValid(params)) {
    return {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      property: params.property as LocationStatsOrderProperty,
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      direction: params.direction as ListDirection,
    }
  }
  throw invalidLocationStatsQueryError
}

function styleStatsParamsOrDefaults(
  query: Record<string, unknown>,
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

export function validateStyleStatsOrder(
  query: Record<string, unknown>,
): StyleStatsOrder {
  const params = styleStatsParamsOrDefaults(query)
  if (isStyleStatsOrderValid(params)) {
    return {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      property: params.property as StyleStatsOrderProperty,
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      direction: params.direction as ListDirection,
    }
  }
  throw invalidStyleStatsQueryError
}
