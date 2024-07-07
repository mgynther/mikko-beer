export function getEnvVariable (name: string): string {
  if (process.env[name] === undefined) {
    throw new Error(`environment variable ${name} not found`)
  }

  const str: string = process.env[name]
  return str
}
