import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from './test-context.js'
import { FileMigrationProvider, Migrator, NO_MIGRATIONS } from 'kysely'
import * as path from 'path'
import { promises as fs } from 'fs'

const directory = dirname(fileURLToPath(import.meta.url));

describe('migrate down', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  // This is to ensure down functions in migrations do not throw.
  it('migrate to initial', async () => {
    const migrator = new Migrator({
      db: ctx.db.getDb(),
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(directory, '../../src/data/migrations'),
      }),
    })
    await migrator.migrateTo(NO_MIGRATIONS)
  })
})
