import type { ConnectionConfig } from 'pg'
import { getEnvVariable } from '../env-helper'

export const config: ConnectionConfig = Object.freeze({
  database: getEnvVariable('DATABASE'),
  host: getEnvVariable('DATABASE_HOST'),
  user: getEnvVariable('DATABASE_USER'),
  password: getEnvVariable('DATABASE_PASSWORD')
})
