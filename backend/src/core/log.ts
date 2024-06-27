export enum Level {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}
export const INFO = Level.INFO
export const WARN = Level.WARN
export const ERROR = Level.ERROR

export type log = (level: Level, ...args: unknown[]) => void
