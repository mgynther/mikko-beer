export interface ErrorResponse {
  status: number
  body: {
    error: {
      code: string
      message: string
    }
  }
}

// Turns whatever was thrown while handling a request into the response to
// send. The web layer knows no error of the layers behind it, so it is
// handed this rather than deciding itself.
export type ErrorHandler = (error: unknown) => ErrorResponse
