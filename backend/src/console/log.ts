export type Level = 'INFO' | 'WARN' | 'ERROR'

export type log = (
  level: Level,
  ...args: (string | object | Error | unknown)[]
) => void
