export enum Level {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}
export const INFO = Level.INFO
export const WARN = Level.WARN
export const ERROR = Level.ERROR

export function log (level: Level, ...args: unknown[]): void {
  const timestamp = new Date().toISOString()
  getLogger(level)(timestamp, level, ':', ...args)
}

function getLogger (
  level: Level
): (message: unknown, ...optionalParams: unknown[]) => void {
  switch (level) {
    case Level.INFO: return console.log
    case Level.WARN: return console.warn
    case Level.ERROR: return console.error
  }
}
