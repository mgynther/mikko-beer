import * as styleRepository from '../../data/style/style.repository'
import { type Transaction } from '../../data/database'
import * as styleService from '../../core/style/style.service'
import * as authHelper from '../authentication/authentication-helper'

import { type Router } from '../router'
import {
  type CreateStyleRequest,
  type NewStyle,
  type Style,
  type UpdateStyleRequest,
  validateCreateStyleRequest,
  validateUpdateStyleRequest,
  StyleRelationship
} from '../../core/style/style'
import { ControllerError } from '../../core/errors'
import { ParentStyleNotFoundError } from '../../core/style/style.service'
import { CyclicRelationshipError } from '../../core/style/style.util'

function handleError (e: unknown): void {
  if (e instanceof CyclicRelationshipError) {
    throw new ControllerError(
      400,
      'CyclicStyleRelationship',
      'cyclic style relationships are not allowed'
    )
  }
  if (e instanceof ParentStyleNotFoundError) {
    throw new ControllerError(
      400,
      'ParentStyleNotFound',
      'parent style was not found'
    )
  }
  throw e
}

export function styleController (router: Router): void {
  router.post('/api/v1/style',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const createStyleRequest = validateCreateRequest(body)
      try {
        const result = await ctx.db.executeTransaction(async (trx) => {
          const createIf: styleService.CreateStyleIf = {
            create: (
              style: NewStyle
            ) => styleRepository.insertStyle(trx, style),
            lockStyles: createStyleLocker(trx),
            insertParents: createParentInserter(trx),
            listAllRelationships: createLister(trx)
          }
          return await styleService.createStyle(
            createIf, createStyleRequest, ctx.log)
        })

        ctx.status = 201
        ctx.body = {
          style: result
        }
      } catch (e) {
        handleError(e)
      }
    }
  )

  router.put('/api/v1/style/:styleId',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { styleId } = ctx.params

      try {
        const updateStyleRequest = validateUpdateRequest(body, styleId)
        const result = await ctx.db.executeTransaction(async (trx) => {
          const updateIf: styleService.UpdateStyleIf = {
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
            updateIf, styleId, updateStyleRequest, ctx.log)
        })

        ctx.status = 200
        ctx.body = {
          style: result
        }
      } catch (e) {
        handleError(e)
      }
    }
  )

  router.get(
    '/api/v1/style/:styleId',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { styleId } = ctx.params
      const style = await styleService.findStyleById((styleId: string) => {
        return styleRepository.findStyleById(ctx.db, styleId)
      }, styleId, ctx.log)

      if (style === undefined) {
        throw new ControllerError(
          404,
          'StyleNotFound',
          `style with id ${styleId} was not found`
        )
      }

      ctx.body = { style }
    }
  )

  router.get(
    '/api/v1/style',
    authHelper.authenticateViewer,
    async (ctx) => {
      const styles = await styleService.listStyles(() => {
        return styleRepository.listStyles(ctx.db)
      }, ctx.log)
      ctx.body = { styles }
    }
  )
}

function validateCreateRequest (body: unknown): CreateStyleRequest {
  if (!validateCreateStyleRequest(body)) {
    throw new ControllerError(400, 'InvalidStyle', 'invalid style')
  }

  const result = body as CreateStyleRequest
  return result
}

function validateUpdateRequest (
  body: unknown,
  styleId: string
): UpdateStyleRequest {
  if (!validateUpdateStyleRequest(body)) {
    throw new ControllerError(400, 'InvalidStyle', 'invalid style')
  }
  if (styleId === undefined || styleId === null || styleId.length === 0) {
    throw new ControllerError(400, 'InvalidStyleId', 'invalid style id')
  }

  const result = body as UpdateStyleRequest
  return result
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
