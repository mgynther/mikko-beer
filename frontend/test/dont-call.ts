export interface Console {
  error: (...data: unknown[]) => void
}

export const dontCallWithConsole = (console: Console): never => {
  console.error('must not be called, see stack', new Error().stack)
  throw new Error('must not be called')
}

export const dontCall = (): never => dontCallWithConsole(console)
