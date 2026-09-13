import type { DatabaseConfig } from './database-config.js'
import { getEnvVariable } from '../env-helper.js'

export const config: DatabaseConfig = Object.freeze({
  database: getEnvVariable('DATABASE'),
  host: getEnvVariable('DATABASE_HOST'),
  user: getEnvVariable('DATABASE_USER'),
  password: getEnvVariable('DATABASE_PASSWORD'),
})
