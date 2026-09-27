import type { log } from '../console/log.js'
import { ControllerError } from '../logic/errors.js'
import type { ErrorHandler, ErrorResponse } from '../web/error-response.js'

export function createErrorHandler(log: log): ErrorHandler {
  return (error: unknown): ErrorResponse => {
    if (error instanceof ControllerError) {
      log('INFO', 'controller error', `${error.status}`, error.code)
      return toErrorResponse(error)
    }
    return toErrorResponse(createUnknownError(error, log))
  }
}

function toErrorResponse(error: ControllerError): ErrorResponse {
  return {
    status: error.status,
    body: {
      error: { code: error.code, message: error.message },
    },
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function createUnknownError(error: unknown, log: log): ControllerError {
  if (error instanceof Error) {
    log(
      'ERROR',
      'unknown error, name:',
      `${error.name}, message:`,
      error.message,
    )
  } else {
    log('ERROR', 'unknown error:', error)
  }
  return new ControllerError(500, 'UnknownError', getUnknownErrorMessage(error))
}

function getUnknownErrorMessage(error: unknown): string {
  if (isObject(error) && typeof error.message === 'string') {
    return error.message
  }
  return 'unknown error'
}
