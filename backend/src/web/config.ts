import * as dotenv from 'dotenv'
import { type ConnectionConfig } from 'pg'

import { config as databaseConfig } from '../data/config'
import { getEnvVariable } from '../env-helper'

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
  authTokenExpiryDuration: getEnvVariable('AUTH_TOKEN_EXPIRY_DURATION'),
  database: Object.freeze(databaseConfig)
})
