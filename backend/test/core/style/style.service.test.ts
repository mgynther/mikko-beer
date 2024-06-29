import { expect } from 'chai'
import {
  type Style,
  type StyleWithParentIds,
  type StyleWithParentsAndChildren,
  type CreateStyleRequest,
  type UpdateStyleRequest,
  type NewStyle,
  StyleRelationship
} from '../../../src/core/style/style'
import {
  CyclicRelationshipError,
} from '../../../src/core/style/style.util'
import * as styleService from '../../../src/core/style/style.service'

import { dummyLog as log } from '../dummy-log'
import { ParentStyleNotFoundError } from '../../../src/core/style/style.service'

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
    expect(newStyle).to.eql({ name: style.name })
    return result
  }

  async function lockParent (parents: string[]) {
    expect(parents).to.eql([parentStyle.id])
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
    expect('not to be called').to.equal(false)
  }

  async function insertRelationship (
    styleId: string,
    parents: string[]
  ): Promise<void> {
    expect(styleId).to.equal(style.id)
    expect(parents).to.eql([parentStyle.id])
  }

  it('should create style without parents', async () => {
    const request: CreateStyleRequest = {
      name: style.name,
      parents: []
    }
    const createStyleIf: styleService.CreateStyleIf = {
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
    expect(result).to.eql({
      id: style.id,
      name: style.name,
      parents: [],
    })
  })

  it('should create style with parent', async () => {
    const createIf: styleService.CreateStyleIf = {
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
    expect(result).to.eql({
      id: style.id,
      name: style.name,
      parents: [parentStyle.id],
    })
  })

  it('should fail to create style with invalid parent', async () => {
    const createIf: styleService.CreateStyleIf = {
      create,
      lockStyles: async () => {
        return []
      },
      insertParents: insertRelationship,
      listAllRelationships: noRelationships
    }
    try {
      await styleService.createStyle(
        createIf,
        createWithParentRequest,
        log
      )
      notCalled()
    } catch (e) {
      expect(e instanceof ParentStyleNotFoundError).to.equal(true)
    }
  })

  it('should fail to create with existing cyclic relationship', async () => {
    const request: CreateStyleRequest = {
      name: style.name,
      parents: [parentStyle.id]
    }
    const createIf: styleService.CreateStyleIf = {
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
    try {
      await styleService.createStyle(createIf, request, log)
      expect('not to be called').to.equal(false)
    } catch (e) {
      expect(e).to.eql(new CyclicRelationshipError('Cyclic relationship found'))
    }
  })

  async function deleteStyleChildRelationships (styleId: string): Promise<void> {
    expect(styleId).to.equal(style.id)
  }

  async function update (updateStyle: Style) {
    expect(updateStyle).to.eql(style)
    return updateStyle
  }

  it('should update without parents', async () => {
    const request: UpdateStyleRequest = {
      name: style.name,
      parents: []
    }
    const updateIf: styleService.UpdateStyleIf = {
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
    expect(result).to.eql({
      id: style.id,
      name: style.name,
      parents: [],
    })
  })

  it('should update with parent', async () => {
    const updateIf: styleService.UpdateStyleIf = {
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
    expect(result).to.eql({
      id: style.id,
      name: style.name,
      parents: [parentStyle.id],
    })
  })

  it('fail to update with invalid parent', async () => {
    const updateIf: styleService.UpdateStyleIf = {
      update,
      lockStyles: async () => {
        return []
      },
      insertParents: insertRelationship,
      deleteStyleChildRelationships,
      listAllRelationships: noRelationships
    }
    try {
      await styleService.updateStyle(
        updateIf,
        style.id,
        updateWithParentRequest,
        log
      )
      notCalled()
    } catch (e) {
      expect(e instanceof ParentStyleNotFoundError).to.equal(true)
    }
  })

  it('should fail to update with existing cyclic relationship', async () => {
    const request: UpdateStyleRequest = {
      name: style.name,
      parents: [parentStyle.id]
    }
    const updateIf: styleService.UpdateStyleIf = {
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
    try {
      await styleService.updateStyle(updateIf, style.id, request, log)
      expect('not to be called').to.equal(false)
    } catch (e) {
      expect(e).to.eql(new CyclicRelationshipError('Cyclic relationship found'))
    }
  })

  it('should find style', async () => {
    const finder = async (styleId: string) => {
      expect(styleId).to.equal(style.id)
      return styleWithParentsAndChildren
    }
    const result = await styleService.findStyleById(finder, style.id, log)
    expect(result).to.eql(styleWithParentsAndChildren)
  })

  it('should not find style with unknown id', async () => {
    const id = '76cac82a-58a6-4978-8a00-1de381df032f'
    const finder = async (searchId: string) => {
      expect(searchId).to.equal(id)
      return undefined
    }
    const result = await styleService.findStyleById(finder, id, log)
    expect(result).to.eql(undefined)
  })

  it('should list styles', async () => {
    const lister = async () => {
      return [styleWithParentIds]
    }
    const result = await styleService.listStyles(lister, log)
    expect(result).to.eql([styleWithParentIds])
  })
})
