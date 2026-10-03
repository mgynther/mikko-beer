import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import type {
  ReadStyleBody,
  StyleBody,
  StyleListBody,
} from '../../../src/web/style/style.js'

suite('style tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createStyle(name: string, parents: string[]): Promise<string> {
    const res = await ctx.request.post<StyleBody>(
      `/api/v1/style`,
      { name, parents },
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 201)
    return res.data.style.id
  }

  test('create a style', async () => {
    const ale = await createStyle('Ale', [])
    const request = { name: 'IPA', parents: [ale] }

    const res = await ctx.request.post<StyleBody>(
      `/api/v1/style`,
      request,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, { style: { ...request, id: res.data.style.id } })
  })

  test('find a style with its parents and children', async () => {
    const ale = await createStyle('Ale', [])
    const ipa = await createStyle('IPA', [ale])
    const neipa = await createStyle('NEIPA', [ipa])

    const res = await ctx.request.get<ReadStyleBody>(
      `/api/v1/style/${ipa}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      style: {
        id: ipa,
        name: 'IPA',
        children: [{ id: neipa, name: 'NEIPA' }],
        parents: [{ id: ale, name: 'Ale' }],
      },
    })
  })

  // The style's parents are replaced in the same transaction, which only
  // reading it back shows.
  test('update a style', async () => {
    const [ale, lager] = await Promise.all([
      createStyle('Ale', []),
      createStyle('Lager', []),
    ])
    const id = await createStyle('India Pale Ale', [ale])
    const update = { name: 'India Pale Lager', parents: [lager] }

    const res = await ctx.request.put<StyleBody>(
      `/api/v1/style/${id}`,
      update,
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { style: { ...update, id } })

    const getRes = await ctx.request.get<ReadStyleBody>(
      `/api/v1/style/${id}`,
      ctx.adminAuthHeaders(),
    )
    assertDeepEqual(getRes.data, {
      style: {
        id,
        name: 'India Pale Lager',
        children: [],
        parents: [{ id: lager, name: 'Lager' }],
      },
    })
  })

  test('list styles', async () => {
    const ale = await createStyle('Ale', [])
    const ipa = await createStyle('IPA', [ale])

    const res = await ctx.request.get<StyleListBody>(
      `/api/v1/style`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      styles: [
        { id: ale, name: 'Ale', parents: [] },
        { id: ipa, name: 'IPA', parents: [ale] },
      ],
    })
  })
})
