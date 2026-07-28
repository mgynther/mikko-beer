export enum Level {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export type log = (level: Level, ...args: unknown[]) => void
