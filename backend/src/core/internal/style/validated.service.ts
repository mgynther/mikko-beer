import * as styleService from './service'

import type {
  CreateStyleIf,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
  UpdateStyleIf
} from "../../style/style"
import {
  validateCreateStyleRequest,
  validateStyleId,
  validateUpdateStyleRequest
} from "../../style/style"
import type { log } from '../../log'

export async function createStyle (
  createStyleIf: CreateStyleIf,
  body: unknown,
  log: log
): Promise<StyleWithParentIds> {
  const createStyleRequest = validateCreateStyleRequest(body)
  return await styleService.createStyle(createStyleIf, createStyleRequest, log)
}

export async function updateStyle (
  updateStyleIf: UpdateStyleIf,
  id: string | undefined,
  body: unknown,
  log: log
): Promise<StyleWithParentIds> {
  const validRequest = validateUpdateStyleRequest(body, id)
  return await styleService.updateStyle(
    updateStyleIf,
    validRequest.id,
    validRequest.request,
    log
  )
}

export async function findStyleById (
  find: (id: string) => Promise<StyleWithParentsAndChildren | undefined>,
  id: string | undefined,
  log: log
): Promise<StyleWithParentsAndChildren> {
  return await styleService.findStyleById(
    find,
    validateStyleId(id),
    log
  )
}

export async function listStyles (
  list: () => Promise<StyleWithParentIds[]>,
  log: log
): Promise<StyleWithParentIds[]> {
  return await styleService.listStyles(list, log)
}
