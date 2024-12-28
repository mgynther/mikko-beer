import { expect } from 'earl'

import {
  cyclicRelationshipError,
  parentStyleNotFoundError,
  styleNotFoundError
} from '../../../../src/core/errors'
import type {
  Style,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
  CreateStyleRequest,
  UpdateStyleRequest,
  NewStyle,
  StyleRelationship,
  CreateStyleIf,
  UpdateStyleIf
} from '../../../../src/core/style'
import * as styleService from '../../../../src/core/internal/style/service'

import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'

const style: Style = {
  id: '71dcc323-7e59-4122-9afa-d4ffc484dee6',
  name: 'imperial gose',
}

const parentStyle: Style = {
  id: '0ba08b98-44af-46ea-b88d-35f01764b638',
  name: 'gose'
}

const styleWithParentIds: StyleWithParentIds = {
  ...style,
  parents: [parentStyle.id]
}

const styleWithParentsAndChildren: StyleWithParentsAndChildren = {
  ...style,
  children: [],
  parents: [parentStyle]
}

const createWithParentRequest: CreateStyleRequest = {
  name: style.name,
  parents: [parentStyle.id]
}

const updateWithParentRequest: UpdateStyleRequest = {
  name: style.name,
  parents: [parentStyle.id]
}

describe('style service unit tests', () => {
  async function create (newStyle: NewStyle) {
    const result = {
      id: style.id,
      name: style.name,
    }
    expect(newStyle).toEqual({ name: style.name })
    return result
  }

  async function lockParent (parents: string[]) {
    expect(parents).toEqual([parentStyle.id])
    return [parentStyle.id]
  }

  async function noParentLocking () {
    await notCalled()
    return []
  }

  async function noRelationships (): Promise<StyleRelationship[]> {
    return []
  }

  async function notCalled(): Promise<void> {
    throw new Error('not to be called')
  }

  async function insertRelationship (
    styleId: string,
    parents: string[]
  ): Promise<void> {
    expect(styleId).toEqual(style.id)
    expect(parents).toEqual([parentStyle.id])
  }

  it('create style without parents', async () => {
    const request: CreateStyleRequest = {
      name: style.name,
      parents: []
    }
    const createStyleIf: CreateStyleIf = {
      create,
      insertParents: notCalled,
      listAllRelationships: noRelationships,
      lockStyles: async function(): Promise<string[]> {
        await notCalled()
        return []
      }
    }
    const result = await styleService.createStyle(
      createStyleIf,
      request,
      log
    )
    expect(result).toEqual({
      id: style.id,
      name: style.name,
      parents: [],
    })
  })

  it('create style with parent', async () => {
    const createIf: CreateStyleIf = {
      create,
      lockStyles: lockParent,
      insertParents: insertRelationship,
      listAllRelationships: noRelationships
    }
    const result = await styleService.createStyle(
      createIf,
      createWithParentRequest,
      log
    )
    expect(result).toEqual({
      id: style.id,
      name: style.name,
      parents: [parentStyle.id],
    })
  })

  it('fail to create style with invalid parent', async () => {
    const createIf: CreateStyleIf = {
      create,
      lockStyles: async () => {
        return []
      },
      insertParents: insertRelationship,
      listAllRelationships: noRelationships
    }
    expectReject(async () => {
      await styleService.createStyle(
        createIf,
        createWithParentRequest,
        log
      )
    }, parentStyleNotFoundError)
  })

  it('fail to create with existing cyclic relationship', async () => {
    const request: CreateStyleRequest = {
      name: style.name,
      parents: [parentStyle.id]
    }
    const createIf: CreateStyleIf = {
      create,
      lockStyles: lockParent,
      insertParents: notCalled,
      listAllRelationships: async function(): Promise<StyleRelationship[]> {
        const id1 = '22f915bc-2202-4b16-b39f-cceff957833d'
        const id2 = '60e3102f-c333-49a8-b956-10095e963ccc'
        return [
          { child: id1, parent: id2 },
          { child: id2, parent: id1 },
        ]
      }
    }
    expectReject(async () => {
      await styleService.createStyle(createIf, request, log)
    }, cyclicRelationshipError)
  })

  async function deleteStyleChildRelationships (styleId: string): Promise<void> {
    expect(styleId).toEqual(style.id)
  }

  async function update (updateStyle: Style) {
    expect(updateStyle).toEqual(style)
    return updateStyle
  }

  it('update without parents', async () => {
    const request: UpdateStyleRequest = {
      name: style.name,
      parents: []
    }
    const updateIf: UpdateStyleIf = {
      update,
      lockStyles: noParentLocking,
      insertParents: notCalled,
      deleteStyleChildRelationships,
      listAllRelationships: noRelationships
    }
    const result = await styleService.updateStyle(
      updateIf,
      style.id,
      request,
      log
    )
    expect(result).toEqual({
      id: style.id,
      name: style.name,
      parents: [],
    })
  })

  it('update with parent', async () => {
    const updateIf: UpdateStyleIf = {
      update,
      lockStyles: lockParent,
      insertParents: insertRelationship,
      deleteStyleChildRelationships,
      listAllRelationships: noRelationships
    }
    const result = await styleService.updateStyle(
      updateIf,
      style.id,
      updateWithParentRequest,
      log
    )
    expect(result).toEqual({
      id: style.id,
      name: style.name,
      parents: [parentStyle.id],
    })
  })

  it('fail to update with invalid parent', async () => {
    const updateIf: UpdateStyleIf = {
      update,
      lockStyles: async () => {
        return []
      },
      insertParents: insertRelationship,
      deleteStyleChildRelationships,
      listAllRelationships: noRelationships
    }
    expectReject(async () => {
      await styleService.updateStyle(
        updateIf,
        style.id,
        updateWithParentRequest,
        log
      )
    }, parentStyleNotFoundError)
  })

  it('fail to update with existing cyclic relationship', async () => {
    const request: UpdateStyleRequest = {
      name: style.name,
      parents: [parentStyle.id]
    }
    const updateIf: UpdateStyleIf = {
      update,
      lockStyles: lockParent,
      insertParents: notCalled,
      deleteStyleChildRelationships: notCalled,
      listAllRelationships: async function(): Promise<StyleRelationship[]> {
        const id1 = '22f915bc-2202-4b16-b39f-cceff957833d'
        const id2 = '60e3102f-c333-49a8-b956-10095e963ccc'
        return [
          { child: id1, parent: id2 },
          { child: id2, parent: id1 },
        ]
      }
    }
    expectReject(async () => {
      await styleService.updateStyle(updateIf, style.id, request, log)
    }, cyclicRelationshipError)
  })

  it('find style', async () => {
    const finder = async (styleId: string) => {
      expect(styleId).toEqual(style.id)
      return styleWithParentsAndChildren
    }
    const result = await styleService.findStyleById(finder, style.id, log)
    expect(result).toEqual(styleWithParentsAndChildren)
  })

  it('fail to find style with unknown id', async () => {
    const id = '76cac82a-58a6-4978-8a00-1de381df032f'
    const finder = async (searchId: string) => {
      expect(searchId).toEqual(id)
      return undefined
    }
    expectReject(async () => {
      await styleService.findStyleById(finder, id, log)
    }, styleNotFoundError(id))
  })

  it('list styles', async () => {
    const lister = async () => {
      return [styleWithParentIds]
    }
    const result = await styleService.listStyles(lister, log)
    expect(result).toEqual([styleWithParentIds])
  })
})
