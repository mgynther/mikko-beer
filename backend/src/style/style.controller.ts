import * as styleService from './style.service'
import * as authenticationService from '../authentication/authentication.service'

import { type Router } from '../router'
import { type CreateStyleRequest, validateCreateStyleRequest } from './style'
import { ControllerError } from '../util/errors'

export function styleController (router: Router): void {
  router.post('/api/v1/style',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const { body } = ctx.request

      const createStyleRequest = validateCreateRequest(body)
      const result = await ctx.db.transaction().execute(async (trx) => {
        return await styleService.createStyle(trx, createStyleRequest)
      })

      ctx.status = 201
      ctx.body = {
        style: result
      }
    }
  )

  router.get(
    '/api/v1/style/:styleId',
    authenticationService.authenticateGeneric,
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
    authenticationService.authenticateGeneric,
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
