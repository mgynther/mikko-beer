import type { Level, log } from './log.js'

export const consoleLog: log = (level: Level, ...args: unknown[]): void => {
  const timestamp = new Date().toISOString()
  getLogger(level)(timestamp, level, ':', ...args)
}

function getLogger(
  level: Level,
): (message: unknown, ...optionalParams: unknown[]) => void {
  switch (level) {
    case 'INFO':
      return console.log
    case 'WARN':
      return console.warn
    case 'ERROR':
      return console.error
  }
}
