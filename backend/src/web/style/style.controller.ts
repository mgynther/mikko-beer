import * as styleService from '../../core/style/authorized.service.js'

import * as styleRepository from '../../data/style/style.repository.js'

import type {
  CreateStyleIf,
  NewStyle,
  Style,
  StyleRelationship,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
  UpdateStyleIf,
} from '../../core/style/style.js'
import type { Transaction } from '../../data/database.js'
import type { Router } from '../router.js'

import { parseAuthToken } from '../authentication/authentication-helper.js'
import type { Context } from '../context.js'

export interface CreatedOrUpdatedStyle {
  id: string
  name: string
  parents: string[]
}

interface CreateResult {
  status: 201
  body: {
    style: CreatedOrUpdatedStyle
  }
}

interface UpdateResult {
  status: 200
  body: {
    style: CreatedOrUpdatedStyle
  }
}

export interface ReadStyle {
  id: string
  name: string
  children: Array<{
    id: string
    name: string
  }>
  parents: Array<{
    id: string
    name: string
  }>
}

interface ReadResult {
  status: 200
  body: {
    style: ReadStyle
  }
}

export interface ListedStyle {
  id: string
  name: string
  parents: string[]
}

interface ListResult {
  status: 200
  body: {
    styles: Array<ListedStyle>
  }
}

export function styleController(router: Router): void {
  router.post('/api/v1/style', async (ctx: Context): Promise<CreateResult> => {
    const authTokenPayload = parseAuthToken(ctx)
    const body: unknown = ctx.request.body

    const result = await ctx.db.executeReadWriteTransaction(
      async (trx): Promise<StyleWithParentIds> => {
        const createIf: CreateStyleIf = {
          create: async (style: NewStyle): Promise<Style> =>
            await styleRepository.insertStyle(trx, style),
          lockStyles: createStyleLocker(trx),
          insertParents: createParentInserter(trx),
          listAllRelationships: createLister(trx),
        }
        return await styleService.createStyle(
          createIf,
          {
            authTokenPayload,
            body,
          },
          ctx.log,
        )
      },
    )

    return {
      status: 201,
      body: {
        style: result,
      },
    }
  })

  router.put(
    '/api/v1/style/:styleId',
    async (ctx: Context): Promise<UpdateResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const body: unknown = ctx.request.body
      const styleId: string | undefined = ctx.params.styleId

      const result = await ctx.db.executeReadWriteTransaction(
        async (trx): Promise<StyleWithParentIds> => {
          const updateIf: UpdateStyleIf = {
            update: async (style: Style): Promise<Style> =>
              await styleRepository.updateStyle(trx, style),
            lockStyles: createStyleLocker(trx),
            insertParents: createParentInserter(trx),
            listAllRelationships: createLister(trx),
            deleteStyleChildRelationships: async (
              styleId: string,
            ): Promise<void> => {
              await styleRepository.deleteStyleChildRelationships(trx, styleId)
            },
          }
          return await styleService.updateStyle(
            updateIf,
            {
              authTokenPayload,
              id: styleId,
            },
            body,
            ctx.log,
          )
        },
      )

      return {
        status: 200,
        body: {
          style: result,
        },
      }
    },
  )

  router.get(
    '/api/v1/style/:styleId',
    async (ctx: Context): Promise<ReadResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const styleId: string | undefined = ctx.params.styleId
      const style = await styleService.findStyleById(
        async (
          styleId: string,
        ): Promise<StyleWithParentsAndChildren | undefined> =>
          await styleRepository.findStyleById(ctx.db, styleId),
        {
          authTokenPayload,
          id: styleId,
        },
        ctx.log,
      )

      return {
        status: 200,
        body: { style },
      }
    },
  )

  router.get('/api/v1/style', async (ctx: Context): Promise<ListResult> => {
    const authTokenPayload = parseAuthToken(ctx)
    const styles = await styleService.listStyles(
      async (): Promise<StyleWithParentIds[]> =>
        await styleRepository.listStyles(ctx.db),
      authTokenPayload,
      ctx.log,
    )
    return {
      status: 200,
      body: { styles },
    }
  })
}

function createParentInserter(
  trx: Transaction,
): (styleId: string, parents: string[]) => Promise<void> {
  return async function (styleId: string, parents: string[]): Promise<void> {
    const relationships = parents.map((parent): StyleRelationship => ({
      parent,
      child: styleId,
    }))
    await styleRepository.insertStyleRelationships(trx, relationships)
  }
}

function createLister(trx: Transaction): () => Promise<StyleRelationship[]> {
  return async function (): Promise<StyleRelationship[]> {
    return await styleRepository.listStyleRelationships(trx)
  }
}

function createStyleLocker(
  trx: Transaction,
): (styleIds: string[]) => Promise<string[]> {
  return async function (styleIds: string[]): Promise<string[]> {
    return await styleRepository.lockStyles(trx, styleIds)
  }
}
