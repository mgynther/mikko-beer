import type { ConnectionConfig } from 'pg'

export const testConfig: ConnectionConfig = {
  host: 'localhost',
  database: 'mikko_beer_test',
  user: 'postgres',
}
export const testAdminConfig: ConnectionConfig = {
  host: 'localhost',
  database: 'postgres',
  user: 'postgres',
}
