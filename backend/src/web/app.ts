import * as Koa from 'koa'
import cors = require('@koa/cors')
import * as json from 'koa-json'
import * as compress from 'koa-compress'
import * as bodyParser from 'koa-bodyparser'
import { type Server } from 'http'
import { v4 as uuidv4 } from 'uuid'

import { type Config } from './config'
import { type Context, type ContextExtension } from './context'
import { Database } from '../data/database'
import * as userRepository from '../data/user/user.repository'
import { Router } from './router'
import { beerController } from '../web/beer/beer.controller'
import { breweryController } from '../web/brewery/brewery.controller'
import { containerController } from '../web/container/container.controller'
import { reviewController } from '../web/review/review.controller'
import { storageController } from '../web/storage/storage.controller'
import { statsController } from '../web/stats/stats.controller'
import { styleController } from '../web/style/style.controller'
import { userController } from '../web/user/user.controller'
import {
  type CreateAnonymousUserRequest,
  Role,
  type User
} from '../core/user/user'
import * as userService from '../core/user/user.service'
import {
  addPasswordSignInMethod
} from '../web/user/sign-in-method/sign-in-method.controller'
import { ControllerError } from '../core/errors'
import { log } from '../core/log'
import { type AuthTokenConfig } from '../core/authentication/auth-token'

export interface StartResult {
  authToken: string,
  initialAdminUsername: string | undefined,
  initialAdminPassword: string | undefined
}

export class App {
  #config: Config
  #log: log
  #koa: Koa<any, ContextExtension>
  #router: Router
  #db: Database
  #server?: Server

  constructor (config: Config, log: log) {
    this.#config = config
    this.#log = log
    this.#koa = new Koa()
    this.#koa.use(cors())
    this.#router = new Router()
    this.#db = new Database(this.#config.database)

    this.#koa.use(compress())
    this.#koa.use(bodyParser())
    this.#koa.use(json())

    this.#koa.use(this.errorHandler)
    this.#koa.use(this.decorateContext)

    beerController(this.#router)
    breweryController(this.#router)
    containerController(this.#router)
    reviewController(this.#router)
    storageController(this.#router)
    statsController(this.#router)
    styleController(this.#router)
    userController(this.#router, this.#config)

    this.#koa.use(this.#router.routes())
    this.#koa.use(this.#router.allowedMethods())
  }

  get db (): Database {
    return this.#db
  }

  async start (): Promise<StartResult> {
    return await new Promise<StartResult>((resolve) => {
      const port = this.#config.port
      const db = this.#db
      const isAdminPasswordNeeded = this.#config.generateInitialAdminPassword
      const startResult: StartResult = {
        authToken: '',
        initialAdminUsername: undefined,
        initialAdminPassword: undefined
      }
      function logWithAdminPassword (...args: any[]): void {
        if (isAdminPasswordNeeded) {
          console.log(...args)
        }
      }
      userRepository.listUsers(db).then((users: User[]) => {
        let createPromise: Promise<void> | undefined
        if (users === undefined || users.length === 0) {
          logWithAdminPassword('No users. Creating initial admin')
          const adminUsername = uuidv4()
          const adminPassword = uuidv4()
          createPromise = db.executeTransaction(async (trx) => {
            const authTokenConfig: AuthTokenConfig ={
              secret: this.#config.authTokenSecret,
              expiryDuration: this.#config.authTokenExpiryDuration
            };
            const user = await userService.createAnonymousUser(
              (request: CreateAnonymousUserRequest) => {
                return userRepository.createAnonymousUser(trx, request)
              },
              async (userId: string) => {
                // Here we don't need a refresh token in db. One will be created
                // when admin user logs in.
                return {
                  id: uuidv4(),
                  userId
                }
              }, Role.admin, authTokenConfig, this.#log)
            startResult.authToken = user.authToken.authToken
            if (isAdminPasswordNeeded) {
              startResult.initialAdminUsername = adminUsername
              startResult.initialAdminPassword = adminPassword
              await addPasswordSignInMethod(
                trx,
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
            // eslint-disable-next-line max-len
            `Created initial user "${adminUsername}" with password "${adminPassword}". Please change the password a.s.a.p.`
          )
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
          resolve(startResult)
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
    ctx.config = this.#config
    ctx.log = this.#log
    await next()
  }
}

function respondError (ctx: Context, error: ControllerError): void {
  ctx.status = error.status
  ctx.body = error.toJSON()
}

function isObject (value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null
}

function createUnknownError (error: unknown): ControllerError {
  return new ControllerError(
    500,
    'UnknownError',
    (isObject(error) ? error.message : undefined) ?? 'unknown error'
  )
}
