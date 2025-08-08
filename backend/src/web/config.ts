import type { ConnectionConfig } from 'pg'

import { config as databaseConfig } from '../data/config'
import { getEnvVariable } from '../env-helper'
import { parseExpiryDurationMin } from './parse'

export interface Config {
  readonly generateInitialAdminPassword: boolean
  readonly port: number
  readonly authTokenSecret: string
  readonly authTokenExpiryDurationMin: number
  readonly database: ConnectionConfig
}

export const config: Config = Object.freeze({
  generateInitialAdminPassword:
    getEnvVariable('GENERATE_INITIAL_ADMIN_PASSWORD') === 'true',
  port: parseInt(getEnvVariable('PORT'), 10),
  authTokenSecret: getEnvVariable('AUTH_TOKEN_SECRET'),
  authTokenExpiryDurationMin: parseExpiryDurationMin(
    getEnvVariable('AUTH_TOKEN_EXPIRY_DURATION_MIN')
  ),
  database: Object.freeze(databaseConfig)
})
