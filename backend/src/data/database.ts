import type { Transaction as KyselyTransaction } from 'kysely'
import { Kysely, PostgresDialect, } from 'kysely'
import type { ConnectionConfig } from 'pg'
import { Pool } from 'pg'

import type { RefreshTokenTable } from './authentication/refresh-token.table.js'
import type {
  PasswordSignInMethodTable
} from './user/sign-in-method/password-sign-in-method.table.js'
import type {
  SignInMethodTable
} from './user/sign-in-method/sign-in-method.table.js'
import type {
  BeerTable,
  BeerBreweryTable,
  BeerStyleTable
} from './beer/beer.table.js'
import type { BreweryTable } from './brewery/brewery.table.js'
import type { ContainerTable } from './container/container.table.js'
import type { LocationTable } from './location/location.table.js'
import type { ReviewTable } from './review/review.table.js'
import type { StorageTable } from './storage/storage.table.js'
import type {
  StyleTable,
  StyleRelationshipTable
} from './style/style.table.js'
import type { UserTable } from './user/user.table.js'

export interface KyselyDatabase {
  beer: BeerTable
  beer_brewery: BeerBreweryTable
  beer_style: BeerStyleTable
  brewery: BreweryTable
  container: ContainerTable
  location: LocationTable
  review: ReviewTable
  storage: StorageTable
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

  trx = (): KyselyTransaction<KyselyDatabase> => this.internalTrx
}

// Abstract Kysely away so it's not visible everywhere.
export class Database {
  private readonly internalDb: Kysely<KyselyDatabase>

  constructor (config: ConnectionConfig) {
    this.internalDb = new Kysely<KyselyDatabase>({
      dialect: new PostgresDialect({
        /* eslint-disable-next-line @typescript-eslint/require-await --
         * async required by interface.
         */
        pool: async (): Promise<Pool> => new Pool(config)
      })
    })
  }

  async destroy (): Promise<void> {
    await this.internalDb.destroy()
  }

  async executeReadWriteTransaction<T>(
    cb: (trx: Transaction) => Promise<T>
  ): Promise<T> {
    const db = this.internalDb
    return await db.transaction().setAccessMode('read write').execute(
      async (trx) => await cb(new Transaction(trx))
    )
  }

  getDb (): Kysely<KyselyDatabase> {
    return this.internalDb
  }
}
