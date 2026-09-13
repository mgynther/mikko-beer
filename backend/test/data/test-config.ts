import type { DatabaseConfig } from '../../src/data/database-config.js'

export const testConfig: DatabaseConfig = {
  host: getEnvVariable('DATABASE_HOST'),
  database: getEnvVariable('DATABASE'),
  user: getEnvVariable('DATABASE_USER'),
  password: getEnvVariable('DATABASE_PASSWORD'),
}
export const testAdminConfig: DatabaseConfig = {
  host: getEnvVariable('DATABASE_HOST'),
  database: 'postgres',
  user: getEnvVariable('DATABASE_USER'),
  password: getEnvVariable('DATABASE_PASSWORD'),
}

function getEnvVariable(name: string): string {
  if (process.env[name] === undefined) {
    throw new Error(`environment variable ${name} not found`)
  }

  const str: string = process.env[name]
  return str
}
