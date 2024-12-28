import * as styleRepository from '../../data/style/style.repository'
import type { Transaction } from '../../data/database'
import * as styleService from '../../core/style.authorized.service'

import type { Router } from '../router'
import type {
  CreateStyleIf,
  NewStyle,
  Style,
  StyleRelationship,
  UpdateStyleIf,
} from '../../core/style'
import { parseAuthToken } from '../authentication/authentication-helper'

export function styleController (router: Router): void {
  router.post('/api/v1/style',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { body } = ctx.request

      const result = await ctx.db.executeTransaction(async (trx) => {
        const createIf: CreateStyleIf = {
          create: (
            style: NewStyle
          ) => styleRepository.insertStyle(trx, style),
          lockStyles: createStyleLocker(trx),
          insertParents: createParentInserter(trx),
          listAllRelationships: createLister(trx)
        }
        return await styleService.createStyle(
          createIf, {
            authTokenPayload,
            body
          }, ctx.log)
      })

      ctx.status = 201
      ctx.body = {
        style: result
      }
    }
  )

  router.put('/api/v1/style/:styleId',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { body } = ctx.request
      const styleId: string | undefined = ctx.params.styleId

      const result = await ctx.db.executeTransaction(async (trx) => {
        const updateIf: UpdateStyleIf = {
          update: (
            style: Style
          ) => styleRepository.updateStyle(trx, style),
          lockStyles: createStyleLocker(trx),
          insertParents: createParentInserter(trx),
          listAllRelationships: createLister(trx),
          deleteStyleChildRelationships: (styleId: string): Promise<void> => {
            return styleRepository.deleteStyleChildRelationships(trx, styleId)
          }
        }
        return await styleService.updateStyle(
          updateIf, {
            authTokenPayload,
            id: styleId
          }, body, ctx.log)
      })

      ctx.status = 200
      ctx.body = {
        style: result
      }
    }
  )

  router.get(
    '/api/v1/style/:styleId',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const styleId: string | undefined = ctx.params.styleId
      const style = await styleService.findStyleById((styleId: string) => {
        return styleRepository.findStyleById(ctx.db, styleId)
      }, {
        authTokenPayload,
        id: styleId
      }, ctx.log)

      ctx.body = { style }
    }
  )

  router.get(
    '/api/v1/style',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const styles = await styleService.listStyles(() => {
        return styleRepository.listStyles(ctx.db)
      }, authTokenPayload, ctx.log)
      ctx.body = { styles }
    }
  )
}

function createParentInserter(trx: Transaction) {
  return async function(
    styleId: string,
    parents: string[]
  ): Promise<void> {
    const relationships = parents.map(parent => ({
      parent,
      child: styleId
    }))
    return styleRepository.insertStyleRelationships(
      trx, relationships) as Promise<unknown> as Promise<void>
  }
}

function createLister(trx: Transaction) {
  return async function(): Promise<StyleRelationship[]> {
    return styleRepository.listStyleRelationships(trx)
  }
}

function createStyleLocker(trx: Transaction) {
  return async function(styleIds: string[]): Promise<string[]> {
    return styleRepository.lockStyles(trx, styleIds)
  }
}
