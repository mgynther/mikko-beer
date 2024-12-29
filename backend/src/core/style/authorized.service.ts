import * as authorizationService from '../internal/auth/authorization.service'
import * as styleService from '../internal/style/validated.service'

import type { BodyRequest, IdRequest } from "../request"
import type {
  CreateStyleIf,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
  UpdateStyleIf
} from "./style"
import type { log } from '../log'
import type { AuthTokenPayload } from '../auth/auth-token'

export async function createStyle (
  createStyleIf: CreateStyleIf,
  request: BodyRequest,
  log: log
): Promise<StyleWithParentIds> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await styleService.createStyle(createStyleIf, request.body, log)
}

export async function updateStyle (
  updateStyleIf: UpdateStyleIf,
  request: IdRequest,
  body: unknown,
  log: log
): Promise<StyleWithParentIds> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await styleService.updateStyle(
    updateStyleIf,
    request.id,
    body,
    log
  )
}

export async function findStyleById (
  find: (id: string) => Promise<StyleWithParentsAndChildren | undefined>,
  request: IdRequest,
  log: log
): Promise<StyleWithParentsAndChildren> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await styleService.findStyleById(
    find,
    request.id,
    log
  )
}

export async function listStyles (
  list: () => Promise<StyleWithParentIds[]>,
  authTokenPayload: AuthTokenPayload,
  log: log
): Promise<StyleWithParentIds[]> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await styleService.listStyles(list, log)
}
