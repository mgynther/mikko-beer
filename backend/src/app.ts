import * as Koa from 'koa'
import * as json from 'koa-json'
import * as compress from 'koa-compress'
import * as bodyParser from 'koa-bodyparser'
import { type Server } from 'http'
import { Kysely, PostgresDialect } from 'kysely'

import { type Config } from './config'
import { type Context, type ContextExtension } from './context'
import { type Database } from './database'
import { Router } from './router'
import { beerController } from './beer/beer.controller'
import { breweryController } from './brewery/brewery.controller'
import { styleController } from './style/style.controller'
import { userController } from './user/user.controller'
import { ControllerError } from './util/errors'
import { isObject } from './util/object'
import { Pool } from 'pg'

export class App {
  #config: Config
  #koa: Koa<any, ContextExtension>
  #router: Router
  #db: Kysely<Database>
  #server?: Server

  constructor (config: Config) {
    this.#config = config
    this.#koa = new Koa()
    this.#router = new Router()
    this.#db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: async () => new Pool(this.#config.database)
      })
    })

    this.#koa.use(compress())
    this.#koa.use(bodyParser())
    this.#koa.use(json())

    this.#koa.use(this.errorHandler)
    this.#koa.use(this.decorateContext)

    beerController(this.#router)
    breweryController(this.#router)
    styleController(this.#router)
    userController(this.#router)

    this.#koa.use(this.#router.routes())
    this.#koa.use(this.#router.allowedMethods())
  }

  get db (): Kysely<Database> {
    return this.#db
  }

  async start (): Promise<void> {
    await new Promise<void>((resolve) => {
      this.#server = this.#koa.listen(this.#config.port, resolve)
    })
  }

  async stop (): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.#server?.close((err) => {
        if (err != null) {
          reject(err)
        } else {
          resolve()
        }
      })
    })

    await this.#db?.destroy()
  }

  private readonly errorHandler = async (
    ctx: Context,
    next: Koa.Next
  ): Promise<void> => {
    try {
      await next()
    } catch (error) {
      if (error instanceof ControllerError) {
        respondError(ctx, error)
      } else {
        respondError(ctx, createUnknownError(error))
      }
    }
  }

  private readonly decorateContext = async (
    ctx: Context,
    next: Koa.Next
  ): Promise<void> => {
    ctx.db = this.#db
    await next()
  }
}

function respondError (ctx: Context, error: ControllerError): void {
  ctx.status = error.status
  ctx.body = error.toJSON()
}

function createUnknownError (error: unknown): ControllerError {
  return new ControllerError(
    500,
    'UnknownError',
    (isObject(error) ? error.message : undefined) ?? 'unknown error'
  )
}
