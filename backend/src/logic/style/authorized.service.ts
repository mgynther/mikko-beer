import * as authorizationService from '../internal/auth/authorization.service.js'
import * as styleService from '../internal/style/validated.service.js'

import type { BodyRequest, IdRequest } from '../request'
import type {
  CreateStyleIf,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
  UpdateStyleIf,
  ValidateCreateStyle,
  ValidateStyleId,
  ValidateUpdateStyle,
} from './style'
import type { log } from '../log.js'
import type { AuthTokenPayload } from '../auth/auth-token.js'

export async function createStyle(
  createStyleIf: CreateStyleIf,
  validate: ValidateCreateStyle,
  request: BodyRequest,
  log: log,
): Promise<StyleWithParentIds> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await styleService.createStyle(
    createStyleIf,
    validate,
    request.body,
    log,
  )
}

export async function updateStyle(
  updateStyleIf: UpdateStyleIf,
  validate: ValidateUpdateStyle,
  request: IdRequest,
  body: unknown,
  log: log,
): Promise<StyleWithParentIds> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await styleService.updateStyle(
    updateStyleIf,
    validate,
    request.id,
    body,
    log,
  )
}

export async function findStyleById(
  find: (id: string) => Promise<StyleWithParentsAndChildren | undefined>,
  validateId: ValidateStyleId,
  request: IdRequest,
  log: log,
): Promise<StyleWithParentsAndChildren> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await styleService.findStyleById(find, validateId, request.id, log)
}

export async function listStyles(
  list: () => Promise<StyleWithParentIds[]>,
  authTokenPayload: AuthTokenPayload,
  log: log,
): Promise<StyleWithParentIds[]> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await styleService.listStyles(list, log)
}
