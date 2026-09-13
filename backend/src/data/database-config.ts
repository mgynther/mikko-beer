// The database configuration the rest of the application works with.
//
// This is deliberately not pg's ConnectionConfig. pg is mapped onto this in
// database.ts, at the data layer boundary, so that a breaking change in pg
// stays inside this layer instead of reaching everything that carries a
// configuration around.
export interface DatabaseConfig {
  database: string
  host: string
  user: string
  password: string
}
