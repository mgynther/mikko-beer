import * as authService from '../../core/authentication/authentication.service'
import * as styleService from '../../core/style/style.service'

import type { BodyRequest, IdRequest } from "../request"
import type {
  CreateStyleIf,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
  UpdateStyleIf
} from "./style"
import {
  validateCreateStyleRequest,
  validateStyleId,
  validateUpdateStyleRequest
} from "./style"
import type { log } from '../log'
import type { AuthTokenPayload } from '../authentication/auth-token'

export async function createStyle (
  createStyleIf: CreateStyleIf,
  request: BodyRequest,
  log: log
): Promise<StyleWithParentIds> {
  authService.authenticateAdminPayload(request.authTokenPayload)
  const createStyleRequest = validateCreateStyleRequest(request.body)
  return await styleService.createStyle(createStyleIf, createStyleRequest, log)
}

export async function updateStyle (
  updateStyleIf: UpdateStyleIf,
  request: IdRequest,
  body: unknown,
  log: log
): Promise<StyleWithParentIds> {
  authService.authenticateAdminPayload(request.authTokenPayload)
  const validRequest = validateUpdateStyleRequest(body, request.id)
  return await styleService.updateStyle(
    updateStyleIf,
    validRequest.id,
    validRequest.request,
    log
  )
}

export async function findStyleById (
  find: (id: string) => Promise<StyleWithParentsAndChildren | undefined>,
  request: IdRequest,
  log: log
): Promise<StyleWithParentsAndChildren> {
  authService.authenticateViewerPayload(request.authTokenPayload)
  return await styleService.findStyleById(
    find,
    validateStyleId(request.id),
    log
  )
}

export async function listStyles (
  list: () => Promise<StyleWithParentIds[]>,
  authTokenPayload: AuthTokenPayload,
  log: log
): Promise<StyleWithParentIds[]> {
  authService.authenticateViewerPayload(authTokenPayload)
  return await styleService.listStyles(list, log)
}
