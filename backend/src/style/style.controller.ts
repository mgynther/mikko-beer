import * as styleService from './style.service'
import * as authenticationService from '../authentication/authentication.service'

import { type Router } from '../router'
import { type CreateStyleRequest, type UpdateStyleRequest, validateCreateStyleRequest, validateUpdateStyleRequest } from './style'
import { ControllerError } from '../util/errors'

export function styleController (router: Router): void {
  router.post('/api/v1/style',
    authenticationService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const createStyleRequest = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await styleService.createStyle(trx, createStyleRequest)
      })

      ctx.status = 201
      ctx.body = {
        style: result
      }
    }
  )

  router.put('/api/v1/style/:styleId',
    authenticationService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { styleId } = ctx.params

      const updateStyleRequest = validateUpdateRequest(body, styleId)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await styleService.updateStyle(trx, styleId, updateStyleRequest)
      })

      ctx.status = 200
      ctx.body = {
        style: result
      }
    }
  )

  router.get(
    '/api/v1/style/:styleId',
    authenticationService.authenticateViewer,
    async (ctx) => {
      const { styleId } = ctx.params
      const style = await styleService.findStyleById(ctx.db, styleId)

      if (style == null) {
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
    authenticationService.authenticateViewer,
    async (ctx) => {
      const styles = await styleService.listStyles(ctx.db)
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

function validateUpdateRequest (body: unknown, styleId: string): UpdateStyleRequest {
  if (!validateUpdateStyleRequest(body)) {
    throw new ControllerError(400, 'InvalidStyle', 'invalid style')
  }
  if (styleId === undefined || styleId === null || styleId.length === 0) {
    throw new ControllerError(400, 'InvalidStyleId', 'invalid style id')
  }

  const result = body as UpdateStyleRequest
  return result
}
