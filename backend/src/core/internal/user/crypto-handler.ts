export function createHandler (
  resolve: (value: string) => void,
  reject: (error: Error | null) => void
): (err: Error | null, value: string) => void {
  return function (err: Error | null, value: string): void {
    if (err === null) {
      resolve(value)
      return
    }
    reject(err)
  }
}
