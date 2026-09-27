import { ajv } from './internal/ajv.js'
import { parseDate } from './internal/date-parser.js'
import type { ListDirection } from './internal/list.js'
import { directionValidation } from './internal/list.js'

type BreweryCountryStatsOrderProperty =
  'average' | 'brewery_count' | 'count' | 'country_code' | 'std_dev'

export interface BreweryCountryStatsOrder {
  property: BreweryCountryStatsOrderProperty
  direction: ListDirection
}

type BreweryStatsOrderProperty =
  'average' | 'brewery_name' | 'count' | 'std_dev'

export interface BreweryStatsOrder {
  property: BreweryStatsOrderProperty
  direction: ListDirection
}

type LocationStatsOrderProperty =
  'average' | 'location_name' | 'count' | 'std_dev'

export interface LocationStatsOrder {
  property: LocationStatsOrderProperty
  direction: ListDirection
}

type StyleStatsOrderProperty = 'average' | 'style_name' | 'count' | 'std_dev'

export interface StyleStatsOrder {
  property: StyleStatsOrderProperty
  direction: ListDirection
}

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

export interface StatsIdFilterQuery {
  brewery: string | undefined
  location: string | undefined
  style: string | undefined
}

export interface StatsFilterQuery extends StatsIdFilterQuery {
  minReviewCount: string | undefined
  maxReviewCount: string | undefined
  minReviewAverage: string | undefined
  maxReviewAverage: string | undefined
  timeStart: string | undefined
  timeEnd: string | undefined
}

export interface StatsOrderQuery {
  order: string | undefined
  direction: string | undefined
}

export type StatsIdFilterValidationResult =
  | {
      errorCode: 'invalid-id-filter'
      result: undefined
    }
  | {
      errorCode: undefined
      result: StatsIdFilter
    }

export type StatsFilterValidationResult =
  | {
      errorCode: 'invalid-id-filter'
      result: undefined
    }
  | {
      errorCode: undefined
      result: StatsFilter
    }

type BreweryCountryStatsOrderValidationResult =
  | {
      errorCode: 'invalid-brewery-country-stats-query'
      result: undefined
    }
  | {
      errorCode: undefined
      result: BreweryCountryStatsOrder
    }

type BreweryStatsOrderValidationResult =
  | {
      errorCode: 'invalid-brewery-stats-query'
      result: undefined
    }
  | {
      errorCode: undefined
      result: BreweryStatsOrder
    }

type LocationStatsOrderValidationResult =
  | {
      errorCode: 'invalid-location-stats-query'
      result: undefined
    }
  | {
      errorCode: undefined
      result: LocationStatsOrder
    }

type StyleStatsOrderValidationResult =
  | {
      errorCode: 'invalid-style-stats-query'
      result: undefined
    }
  | {
      errorCode: undefined
      result: StyleStatsOrder
    }

function validStatsIdFilter(
  query: StatsIdFilterQuery,
): StatsIdFilter | undefined {
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
  query: StatsIdFilterQuery,
): StatsIdFilterValidationResult {
  const result = validStatsIdFilter(query)
  if (result === undefined) {
    return { errorCode: 'invalid-id-filter', result: undefined }
  }
  return { errorCode: undefined, result }
}

export function validateStatsFilter(
  query: StatsFilterQuery,
): StatsFilterValidationResult {
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
  const idFilterResult = validateStatsIdFilter(query)
  if (idFilterResult.errorCode === 'invalid-id-filter') {
    return { errorCode: 'invalid-id-filter', result: undefined }
  }
  const result = {
    ...defaultResult,
    ...idFilterResult.result,
  }
  const {
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage,
    timeStart,
    timeEnd,
  } = query
  type NumberKey =
    | 'maxReviewAverage'
    | 'minReviewAverage'
    | 'maxReviewCount'
    | 'minReviewCount'
  function assignValidNumber(
    key: NumberKey,
    value: string | undefined,
    validator: (value: number) => boolean,
    parser: (valud: string) => number,
  ): void {
    if (value !== undefined && value.length > 0) {
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
    maxReviewAverage,
    validateAverage,
    parseFloat,
  )
  assignValidNumber(
    'minReviewAverage',
    minReviewAverage,
    validateAverage,
    parseFloat,
  )
  assignValidNumber('maxReviewCount', maxReviewCount, validateCount, parseInt)
  assignValidNumber('minReviewCount', minReviewCount, validateCount, parseInt)

  function assignValidDate(
    key: 'timeStart' | 'timeEnd',
    value: string | undefined,
  ): void {
    const dateOrUndefined = parseDate(value)
    if (dateOrUndefined !== undefined) {
      result[key] = dateOrUndefined
    }
  }
  assignValidDate('timeStart', timeStart)
  assignValidDate('timeEnd', timeEnd)
  return { errorCode: undefined, result }
}

const doValidateBreweryCountryStatsOrder =
  ajv.compile<BreweryCountryStatsOrder>({
    type: 'object',
    properties: {
      property: {
        enum: ['average', 'brewery_count', 'count', 'country_code', 'std_dev'],
      },
      direction: directionValidation,
    },
    required: ['property', 'direction'],
    additionalProperties: false,
  })

function isBreweryCountryStatsOrderValid(body: unknown): boolean {
  return doValidateBreweryCountryStatsOrder(body)
}

const doValidateBreweryStatsOrder = ajv.compile<BreweryStatsOrder>({
  type: 'object',
  properties: {
    property: {
      enum: ['average', 'brewery_name', 'count', 'std_dev'],
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
      enum: ['average', 'location_name', 'count', 'std_dev'],
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
      enum: ['average', 'style_name', 'count', 'std_dev'],
    },
    direction: directionValidation,
  },
  required: ['property', 'direction'],
  additionalProperties: false,
})

function isStyleStatsOrderValid(body: unknown): boolean {
  return doValidateStyleStatsOrder(body)
}

interface StatsOrderParams {
  property: unknown
  direction: unknown
}

function statsOrderParamsOrDefaults(
  query: StatsOrderQuery,
  defaultProperty: string,
): StatsOrderParams {
  let { order, direction } = query
  if (order === undefined || order === '') {
    order = defaultProperty
  }
  if (direction === undefined || direction === '') {
    direction = 'asc'
  }
  return { property: order, direction }
}

export function validateBreweryCountryStatsOrder(
  query: StatsOrderQuery,
): BreweryCountryStatsOrderValidationResult {
  const params = statsOrderParamsOrDefaults(query, 'country_code')
  if (!isBreweryCountryStatsOrderValid(params)) {
    return {
      errorCode: 'invalid-brewery-country-stats-query',
      result: undefined,
    }
  }
  return {
    errorCode: undefined,
    result: {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      property: params.property as BreweryCountryStatsOrderProperty,
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      direction: params.direction as ListDirection,
    },
  }
}

export function validateBreweryStatsOrder(
  query: StatsOrderQuery,
): BreweryStatsOrderValidationResult {
  const params = statsOrderParamsOrDefaults(query, 'brewery_name')
  if (!isBreweryStatsOrderValid(params)) {
    return { errorCode: 'invalid-brewery-stats-query', result: undefined }
  }
  return {
    errorCode: undefined,
    result: {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      property: params.property as BreweryStatsOrderProperty,
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      direction: params.direction as ListDirection,
    },
  }
}

export function validateLocationStatsOrder(
  query: StatsOrderQuery,
): LocationStatsOrderValidationResult {
  const params = statsOrderParamsOrDefaults(query, 'location_name')
  if (!isLocationStatsOrderValid(params)) {
    return { errorCode: 'invalid-location-stats-query', result: undefined }
  }
  return {
    errorCode: undefined,
    result: {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      property: params.property as LocationStatsOrderProperty,
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      direction: params.direction as ListDirection,
    },
  }
}

export function validateStyleStatsOrder(
  query: StatsOrderQuery,
): StyleStatsOrderValidationResult {
  const params = statsOrderParamsOrDefaults(query, 'style_name')
  if (!isStyleStatsOrderValid(params)) {
    return { errorCode: 'invalid-style-stats-query', result: undefined }
  }
  return {
    errorCode: undefined,
    result: {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      property: params.property as StyleStatsOrderProperty,
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      direction: params.direction as ListDirection,
    },
  }
}
