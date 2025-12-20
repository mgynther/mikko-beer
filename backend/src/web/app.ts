import * as Koa from 'koa'
import * as compress from 'koa-compress'
import { bodyParser } from '@koa/bodyparser'
import type { Server } from 'node:http'
import { v4 as uuidv4 } from 'uuid'

import type { Config } from './config'
import type { Context } from './context'
import { Database } from '../data/database'
import * as userRepository from '../data/user/user.repository'
import { createRouter } from './router'
import type { Router } from './router'
import { beerController } from './beer/beer.controller'
import { breweryController } from './brewery/brewery.controller'
import { containerController } from './container/container.controller'
import { locationController } from './location/location.controller'
import { reviewController } from './review/review.controller'
import { storageController } from './storage/storage.controller'
import { statsController } from './stats/stats.controller'
import { styleController } from './style/style.controller'
import { userController } from './user/user.controller'
import type { CreateAnonymousUserRequest, User } from '../core/user/user'
import {
  createAddPasswordUserIf
} from './user/sign-in-method/sign-in-method-helper'
import { ControllerError } from '../core/errors'
import type { log } from '../core/log'
import { Level } from '../core/log'
import type { AuthTokenConfig } from '../core/auth/auth-token'
import {
  createInitialUser,
  addPasswordForInitialUser
} from '../core/app-initial-user'

export interface StartResult {
  authToken: string
}

export class App {
  readonly #config: Config
  readonly #log: log
  readonly #koa: Koa<unknown, unknown>
  readonly #router: Router
  readonly #db: Database
  #server?: Server

  constructor (config: Config, log: log) {
    this.#config = config
    this.#log = log
    this.#koa = new Koa()
    this.#db = new Database(this.#config.database)
    const routerResult = createRouter({
      config,
      db: this.#db,
      log
    })
    this.#router = routerResult.router

    this.#koa.use(compress())
    this.#koa.use(bodyParser())

    this.#koa.use(addHeaders)
    this.#koa.use(this.errorHandler)
    this.#koa.use(this.decorateContext)

    beerController(this.#router)
    breweryController(this.#router)
    containerController(this.#router)
    locationController(this.#router)
    reviewController(this.#router)
    storageController(this.#router)
    statsController(this.#router)
    styleController(this.#router)
    userController(this.#router, this.#config)

    this.#koa.use(routerResult.koaRouter.routes())
    this.#koa.use(routerResult.koaRouter.allowedMethods())
  }

  get db (): Database {
    return this.#db
  }

  async start (): Promise<StartResult> {
    /* eslint-disable-next-line promise/avoid-new --
     * Promisefying would be tedious and it could easily hide errors.
     */
    return await new Promise<StartResult>((resolve) => {
      const port = this.#config.port
      const db = this.#db
      const log = this.#log
      const isAdminPasswordNeeded = this.#config.generateInitialAdminPassword
      const startResult: StartResult = {
        authToken: ''
      }
      function logWithAdminPassword (...args: unknown[]): void {
        if (isAdminPasswordNeeded) {
          log(Level.INFO, ...args)
        }
      }
      userRepository.listUsers(db).then((users: User[]) => {
        let createPromise: Promise<void> | undefined = undefined
        if (users.length === 0) {
          logWithAdminPassword('No users. Creating initial admin')
          const adminUsername = uuidv4()
          const adminPassword = uuidv4()
          createPromise = db.executeReadWriteTransaction(async (trx) => {
            const authTokenConfig: AuthTokenConfig ={
              secret: this.#config.authTokenSecret,
              expiryDurationMin: this.#config.authTokenExpiryDurationMin
            };
            const user = await createInitialUser(
              async (request: CreateAnonymousUserRequest) =>
                await userRepository.createAnonymousUser(trx, request),
              authTokenConfig,
              this.#log
            )
            startResult.authToken = user.authToken.authToken
            if (isAdminPasswordNeeded) {
              const addPasswordUserIf = createAddPasswordUserIf(trx)
              await addPasswordForInitialUser(
                addPasswordUserIf,
                user.user.id,
                {
                  username: adminUsername,
                  password: adminPassword
                },
                this.#log
              )
            }
          })
          logWithAdminPassword(
            `Created initial user "${
              adminUsername
            }" with password "${
              adminPassword
            }". Please change the password a.s.a.p.`
          )
        }
        logWithAdminPassword('Server starting')
        /* eslint-disable-next-line promise/avoid-new --
         * Promisefying would be tedious and it could easily hide errors.
         */
        const serverPromise = new Promise<void>((resolve) => {
          this.#server = this.#koa.listen(port, resolve)
        })
        const promises = [serverPromise]
        if (createPromise !== undefined) {
          promises.push(createPromise)
        }
        Promise.all(promises).then(() => {
          logWithAdminPassword(`Server started in port ${port}`)
          resolve(startResult)
        }, (error: unknown) => {
          log(Level.ERROR, 'Error starting', error)
        })
      }, (error: unknown) => {
        log(Level.ERROR, 'Error starting', error)
      })
    })
  }

  async stop (): Promise<void> {
    /* eslint-disable-next-line promise/avoid-new --
     * Promisefying would be tedious and it could easily hide errors.
     */
    await new Promise<void>((resolve, reject) => {
      this.#server?.close((err) => {
        if (err === undefined) {
          resolve()
        } else {
          reject(err)
        }
      })
    })

    await this.#db.destroy()
  }

  private readonly errorHandler = async (
    ctx: Koa.ParameterizedContext,
    next: Koa.Next
  ): Promise<void> => {
    try {
      await next()
    } catch (error) {
      if (error instanceof ControllerError) {
        this.#log(Level.INFO, 'controller error', error.status, error.code)
        respondError(ctx, error)
      } else {
        respondError(ctx, createUnknownError(error, this.#log))
      }
    }
  }

  private readonly decorateContext = async (
    ctx: Context,
    next: Koa.Next
  ): Promise<void> => {
    ctx.db = this.#db
    ctx.config = this.#config
    ctx.log = this.#log
    await next()
  }
}

function respondError (
  ctx: Koa.ParameterizedContext,
  error: ControllerError
): void {
  ctx.status = error.status
  ctx.body = error.toJSON()
}

function isObject (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function createUnknownError (error: unknown, log: log): ControllerError {
  if (error instanceof Error) {
    log(
      Level.ERROR,
      'unknown error, name:',
      `${error.name}, message:`,
      error.message
    )
  } else {
    log(Level.ERROR, 'unknown error:', error)
  }
  return new ControllerError(
    500,
    'UnknownError',
    getUnknownErrorMessage(error)
  )
}

function getUnknownErrorMessage(error: unknown): string {
  if (isObject(error) && typeof error.message === 'string') {
    return error.message
  }
  return 'unknown error'
}

async function addHeaders (
  ctx: Koa.ParameterizedContext,
  next: Koa.Next
): Promise<void> {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  ctx.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH')
  ctx.set('Vary', 'Origin, Accept-Encoding')
  await next()
}
