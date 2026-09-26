export function createErrorLogger(
  message: string,
  logger: (...args: unknown[]) => void,
): (error: unknown) => void {
  return (error: unknown) => {
    logger(message, error)
  }
}
