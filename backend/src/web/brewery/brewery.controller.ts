import * as breweryService from '../../core/brewery/authorized.service.js'
import type { Pagination } from '../../core/pagination.js'
import type { SearchByName } from '../../core/search.js'

import * as breweryRepository from '../../data/brewery/brewery.repository.js'

import * as authHelper from '../authentication/authentication-helper.js'

import type { Router } from '../router.js'
import type {
  Brewery,
  CreateBreweryRequest,
} from '../../core/brewery/brewery.js'
import { validatePagination } from '../../core/pagination.js'
import type { Context } from '../context.js'

export interface CreatedOrUpdatedBrewery {
  id: string
  name: string
}

interface CreateResult {
  status: 201
  body: {
    brewery: CreatedOrUpdatedBrewery
  }
}

interface UpdateResult {
  status: 200
  body: {
    brewery: CreatedOrUpdatedBrewery
  }
}

export interface ReadBrewery {
  id: string
  name: string
}

interface ReadResult {
  status: 200
  body: {
    brewery: ReadBrewery
  }
}

interface ListResult {
  status: 200
  body: {
    breweries: Array<ReadBrewery>
    pagination: {
      size: number
      skip: number
    }
  }
}

interface SearchResult {
  status: 200
  body: {
    breweries: Array<ReadBrewery>
  }
}

export function breweryController(router: Router): void {
  router.post(
    '/api/v1/brewery',
    async (ctx: Context): Promise<CreateResult> => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body

      const result = await ctx.db.executeReadWriteTransaction(
        async (trx) =>
          await breweryService.createBrewery(
            async (brewery: CreateBreweryRequest) =>
              await breweryRepository.insertBrewery(trx, brewery),
            {
              authTokenPayload,
              body,
            },
            ctx.log,
          ),
      )

      return {
        status: 201,
        body: {
          brewery: result,
        },
      }
    },
  )

  router.put(
    '/api/v1/brewery/:breweryId',
    async (ctx: Context): Promise<UpdateResult> => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body
      const breweryId: string | undefined = ctx.params.breweryId

      const result = await ctx.db.executeReadWriteTransaction(
        async (trx) =>
          await breweryService.updateBrewery(
            async (brewery: Brewery) =>
              await breweryRepository.updateBrewery(trx, brewery),
            breweryId,
            {
              authTokenPayload,
              body,
            },
            ctx.log,
          ),
      )

      return {
        status: 200,
        body: {
          brewery: result,
        },
      }
    },
  )

  router.get(
    '/api/v1/brewery/:breweryId',
    async (ctx: Context): Promise<ReadResult> => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const breweryId: string | undefined = ctx.params.breweryId
      const brewery = await breweryService.findBreweryById(
        async (breweryId: string) =>
          await breweryRepository.findBreweryById(ctx.db, breweryId),
        {
          authTokenPayload,
          id: breweryId,
        },
        ctx.log,
      )

      return {
        status: 200,
        body: { brewery },
      }
    },
  )

  router.get('/api/v1/brewery', async (ctx: Context): Promise<ListResult> => {
    const authTokenPayload = authHelper.parseAuthToken(ctx)
    const { skip, size } = ctx.request.query
    const pagination = validatePagination({ skip, size })
    const breweries = await breweryService.listBreweries(
      async (pagination: Pagination) =>
        await breweryRepository.listBreweries(ctx.db, pagination),
      {
        authTokenPayload,
        pagination,
      },
      ctx.log,
    )
    return {
      status: 200,
      body: { breweries, pagination },
    }
  })

  router.post(
    '/api/v1/brewery/search',
    async (ctx: Context): Promise<SearchResult> => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body

      const breweries = await breweryService.searchBreweries(
        async (searchRequest: SearchByName) =>
          await breweryRepository.searchBreweries(ctx.db, searchRequest),
        {
          authTokenPayload,
          body,
        },
        ctx.log,
      )

      return {
        status: 200,
        body: { breweries },
      }
    },
  )
}
