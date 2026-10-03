import * as styleService from '../../logic/style/authorized.service.js'
import type {
  CreateStyleIf,
  NewStyle,
  Style,
  StyleRelationship,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
  UpdateStyleIf,
} from '../../logic/style/style.js'
import type { AuthTokenPayload } from '../../logic/auth/auth-token.js'

import type { Transaction } from '../../data/database.js'
import * as styleRepository from '../../data/style/style.repository.js'

import {
  validateCreateStyleRequest,
  validateStyleId,
  validateUpdateStyleRequest,
} from '../../validation/style.js'

import type {
  ReadStyleBody,
  StyleBody,
  StyleHandlers,
  StyleListBody,
} from '../../web/style/style.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
} from '../../web/request.js'

import { authenticated } from '../authentication/authenticated.js'
import type { Context } from '../context.js'

export function createStyleHandlers(context: Context): StyleHandlers {
  const { config, db, log } = context
  return {
    create: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: BodyRequest,
      ): Promise<StyleBody> => {
        const style = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<StyleWithParentIds> => {
            const createIf: CreateStyleIf = {
              create: async (style: NewStyle): Promise<Style> =>
                await styleRepository.insertStyle(trx, style),
              lockStyles: createStyleLocker(trx),
              insertParents: createParentInserter(trx),
              listAllRelationships: createLister(trx),
            }
            return await styleService.createStyle(
              createIf,
              validateCreateStyleRequest,
              { authTokenPayload, body: request.body },
              log,
            )
          },
        )
        return { style }
      },
    ),

    update: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdBodyRequest,
      ): Promise<StyleBody> => {
        const style = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<StyleWithParentIds> => {
            const updateIf: UpdateStyleIf = {
              update: async (style: Style): Promise<Style | undefined> =>
                await styleRepository.updateStyle(trx, style),
              lockStyles: createStyleLocker(trx),
              insertParents: createParentInserter(trx),
              listAllRelationships: createLister(trx),
              deleteStyleChildRelationships: async (
                styleId: string,
              ): Promise<void> => {
                await styleRepository.deleteStyleChildRelationships(
                  trx,
                  styleId,
                )
              },
            }
            return await styleService.updateStyle(
              updateIf,
              validateUpdateStyleRequest,
              { authTokenPayload, id: request.id },
              request.body,
              log,
            )
          },
        )
        return { style }
      },
    ),

    find: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<ReadStyleBody> => {
        const style = await styleService.findStyleById(
          async (
            styleId: string,
          ): Promise<StyleWithParentsAndChildren | undefined> =>
            await styleRepository.findStyleById(db, styleId),
          validateStyleId,
          { authTokenPayload, id: request.id },
          log,
        )
        return { style }
      },
    ),

    list: authenticated(
      config,
      async (authTokenPayload: AuthTokenPayload): Promise<StyleListBody> => {
        const styles = await styleService.listStyles(
          async (): Promise<StyleWithParentIds[]> =>
            await styleRepository.listStyles(db),
          authTokenPayload,
          log,
        )
        return { styles }
      },
    ),
  }
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
