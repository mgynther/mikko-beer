import * as dotenv from 'dotenv'
import { type ConnectionConfig } from 'pg'

dotenv.config()

export interface Config {
  readonly generateInitialAdminPassword: boolean
  readonly port: number
  readonly authTokenSecret: string
  readonly authTokenExpiryDuration: string
  readonly database: ConnectionConfig
}

export const config: Config = Object.freeze({
  generateInitialAdminPassword:
    getEnvVariable('GENERATE_INITIAL_ADMIN_PASSWORD') === 'true',
  port: parseInt(getEnvVariable('PORT'), 10),
  authTokenSecret: getEnvVariable('AUTH_TOKEN_SECRET'),
  authTokenExpiryDuration: getEnvVariable('AUTH_TOKEN_EXIRY_DURATION'),
  database: Object.freeze({
    database: getEnvVariable('DATABASE'),
    host: getEnvVariable('DATABASE_HOST'),
    user: getEnvVariable('DATABASE_USER'),
    password: getEnvVariable('DATABASE_PASSWORD')
  })
})

function getEnvVariable (name: string): string {
  if (process.env[name] === undefined) {
    throw new Error(`environment variable ${name} not found`)
  }

  const str: string = process.env[name] as string
  return str
}
