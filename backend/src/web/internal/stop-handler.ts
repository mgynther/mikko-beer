export function createStopHandler(
  resolve: () => void,
  reject: (error: Error) => void,
): (error: Error | undefined) => void {
  return (error: Error | undefined): void => {
    if (error) {
      reject(error)
    } else {
      resolve()
    }
  }
}
