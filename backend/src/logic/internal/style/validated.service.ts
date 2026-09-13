import * as styleService from './service.js'

import type {
  CreateStyleIf,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
  UpdateStyleIf,
  ValidateCreateStyle,
  ValidateStyleId,
  ValidateUpdateStyle,
} from '../../style/style.js'
import type { log } from '../../log.js'
import { invalidStyleError, invalidStyleIdError } from '../../errors.js'

export async function createStyle(
  createStyleIf: CreateStyleIf,
  validate: ValidateCreateStyle,
  body: unknown,
  log: log,
): Promise<StyleWithParentIds> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-style') {
    throw invalidStyleError
  }
  return await styleService.createStyle(
    createStyleIf,
    validationResult.result,
    log,
  )
}

export async function updateStyle(
  updateStyleIf: UpdateStyleIf,
  validate: ValidateUpdateStyle,
  id: string | undefined,
  body: unknown,
  log: log,
): Promise<StyleWithParentIds> {
  const validationResult = validate(body, id)
  if (validationResult.errorCode !== undefined) {
    switch (validationResult.errorCode) {
      case 'invalid-style':
        throw invalidStyleError
      case 'invalid-style-id':
        throw invalidStyleIdError
    }
  }
  return await styleService.updateStyle(
    updateStyleIf,
    validationResult.result.id,
    validationResult.result.request,
    log,
  )
}

export async function findStyleById(
  find: (id: string) => Promise<StyleWithParentsAndChildren | undefined>,
  validateStyleId: ValidateStyleId,
  id: string | undefined,
  log: log,
): Promise<StyleWithParentsAndChildren> {
  const idResult = validateStyleId(id)
  if (idResult.errorCode === 'invalid-style-id') {
    throw invalidStyleIdError
  }
  return await styleService.findStyleById(find, idResult.result, log)
}

export async function listStyles(
  list: () => Promise<StyleWithParentIds[]>,
  log: log,
): Promise<StyleWithParentIds[]> {
  return await styleService.listStyles(list, log)
}
