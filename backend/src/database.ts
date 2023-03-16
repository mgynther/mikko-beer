import {
  Kysely,
  PostgresDialect,
  type Transaction as KyselyTransaction
} from 'kysely'
import { Pool } from 'pg'

import { type Config } from './config'
import { type RefreshTokenTable } from './authentication/refresh-token.table'
import {
  type PasswordSignInMethodTable
} from './user/sign-in-method/password-sign-in-method.table'
import {
  type SignInMethodTable
} from './user/sign-in-method/sign-in-method.table'
import {
  type BeerTable,
  type BeerBreweryTable,
  type BeerStyleTable
} from './beer/beer.table'
import { type BreweryTable } from './brewery/brewery.table'
import { type ContainerTable } from './container/container.table'
import { type ReviewTable } from './review/review.table'
import {
  type StyleTable,
  type StyleRelationshipTable
} from './style/style.table'
import { type UserTable } from './user/user.table'

export interface KyselyDatabase {
  beer: BeerTable
  beer_brewery: BeerBreweryTable
  beer_style: BeerStyleTable
  brewery: BreweryTable
  container: ContainerTable
  review: ReviewTable
  style: StyleTable
  style_relationship: StyleRelationshipTable
  user: UserTable
  refresh_token: RefreshTokenTable
  sign_in_method: SignInMethodTable
  password_sign_in_method: PasswordSignInMethodTable
}

export class Transaction {
  private readonly internalTrx: KyselyTransaction<KyselyDatabase>

  constructor (trx: KyselyTransaction<KyselyDatabase>) {
    this.internalTrx = trx
  }

  trx = (): KyselyTransaction<KyselyDatabase> => {
    return this.internalTrx
  }
}

// Abstract Kysely away so it's not visible everywhere.
export class Database {
  private readonly internalDb: Kysely<KyselyDatabase>

  constructor (config: Config) {
    this.internalDb = new Kysely<KyselyDatabase>({
      dialect: new PostgresDialect({
        pool: async () => new Pool(config.database)
      })
    })
  }

  async destroy (): Promise<void> {
    await this.internalDb.destroy()
  }

  async executeTransaction<T>(
    cb: (trx: Transaction) => Promise<T>
  ): Promise<T> {
    const db = this.internalDb
    return await db.transaction().execute(async (trx) => {
      return await cb(new Transaction(trx))
    })
  }

  getDb (): Kysely<KyselyDatabase> {
    return this.internalDb
  }
}
