import * as Koa from 'koa'
import cors = require("@koa/cors")
import * as json from 'koa-json'
import * as compress from 'koa-compress'
import * as bodyParser from 'koa-bodyparser'
import { type Server } from 'http'
import { v4 as uuidv4 } from 'uuid'

import { type Config } from './config'
import { type Context, type ContextExtension } from './context'
import { Database } from './database'
import { Router } from './router'
import { beerController } from './beer/beer.controller'
import { breweryController } from './brewery/brewery.controller'
import { containerController } from './container/container.controller'
import { reviewController } from './review/review.controller'
import { styleController } from './style/style.controller'
import { userController } from './user/user.controller'
import { Role } from './user/user'
import * as userService from './user/user.service'
import { addPasswordSignInMethod } from './user/sign-in-method/sign-in-method.controller'
import { ControllerError } from './util/errors'
import { isObject } from './util/object'

export class App {
  #config: Config
  #koa: Koa<any, ContextExtension>
  #router: Router
  #db: Database
  #server?: Server

  constructor (config: Config) {
    this.#config = config
    this.#koa = new Koa()
    this.#koa.use(cors());
    this.#router = new Router()
    this.#db = new Database(this.#config)

    this.#koa.use(compress())
    this.#koa.use(bodyParser())
    this.#koa.use(json())

    this.#koa.use(this.errorHandler)
    this.#koa.use(this.decorateContext)

    beerController(this.#router)
    breweryController(this.#router)
    containerController(this.#router)
    reviewController(this.#router)
    styleController(this.#router)
    userController(this.#router)

    this.#koa.use(this.#router.routes())
    this.#koa.use(this.#router.allowedMethods())
  }

  get db (): Database {
    return this.#db
  }

  async start (): Promise<string> {
    return await new Promise<string>((resolve) => {
      const port = this.#config.port
      const db = this.#db
      const isAdminPasswordNeeded = this.#config.generateInitialAdminPassword
      function logWithAdminPassword (...args: any[]): void {
        if (isAdminPasswordNeeded) {
          console.log(...args)
        }
      }
      let authToken = ''
      userService.listUsers(db).then(users => {
        let createPromise: Promise<void> | undefined
        if (users === undefined || users.length === 0) {
          logWithAdminPassword('No users. Creating initial admin')
          const adminUsername = uuidv4()
          const adminPassword = uuidv4()
          createPromise = db.executeTransaction(async (trx) => {
            const user = await userService.createAnonymousUser(trx, Role.admin, false)
            authToken = user.authToken.authToken
            if (isAdminPasswordNeeded) {
              await addPasswordSignInMethod(trx, user.user.id, { username: adminUsername, password: adminPassword })
            }
          })
          logWithAdminPassword(`Created initial user "${adminUsername}" with password "${adminPassword}". Please change the password a.s.a.p.`)
        }
        logWithAdminPassword('Server starting')
        const serverPromise = new Promise<void>((resolve) => {
          this.#server = this.#koa.listen(port, resolve)
        })
        const promises = [serverPromise]
        if (createPromise !== undefined) {
          promises.push(createPromise)
        }
        Promise.all(promises).then(() => {
          logWithAdminPassword(`Server started in port ${port}`)
          resolve(authToken)
        }, (error) => {
          console.warn('Error starting', error)
        })
      }, (error) => {
        console.warn('Error starting', error)
      })
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
