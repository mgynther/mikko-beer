import type { Config } from './config.js'
import type { Context } from './context.js'
import { Database } from '../data/database.js'
import type { log } from '../console/log.js'
import { invalidBodyError, invalidQueryError } from '../logic/errors.js'
import { createWebServer } from '../web/web-server.js'
import type { WebErrors, WebServer } from '../web/web-server.js'
import { createApi } from './api.js'
import { createErrorHandler } from './error-handler.js'
import { createInitialUserIfNone } from './initial-user.js'
import type { StartResult } from './initial-user.js'

export class App {
  readonly #config: Config
  readonly #log: log
  readonly #db: Database
  readonly #server: WebServer

  constructor(config: Config, log: log) {
    this.#config = config
    this.#log = log
    this.#db = new Database(config.database)
    const context: Context = { config, db: this.#db, log }
    const webErrors: WebErrors = {
      handle: createErrorHandler(log),
      rejectRepeatedQueryParameter: (): never => {
        throw invalidQueryError
      },
      rejectUnreadableBody: (): never => {
        throw invalidBodyError
      },
    }
    this.#server = createWebServer(createApi(context), webErrors)
  }

  get db(): Database {
    return this.#db
  }

  async start(): Promise<StartResult> {
    try {
      const startResult = await createInitialUserIfNone(
        this.#db,
        this.#config,
        this.#log,
      )
      const port = this.#config.port
      this.#log('INFO', 'Server starting')
      await this.#server.listen(port)
      this.#log('INFO', `Server started in port ${port}`)
      return startResult
    } catch (error) {
      this.#log('ERROR', 'Error starting', error)
      throw error
    }
  }

  async stop(): Promise<void> {
    await this.#server.close()
    await this.#db.destroy()
  }
}
