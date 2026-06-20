export interface Console {
  error: (...data: any[]) => void
}

export const dontCallWithConsole = (console: Console): any => {
  console.error('must not be called, see stack', new Error().stack)
  throw new Error('must not be called')
}

export const dontCall = (): any => {
  dontCallWithConsole(console)
}
