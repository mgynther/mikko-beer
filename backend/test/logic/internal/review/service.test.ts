import { describe, it } from 'node:test'

import {
  referredBeerNotFoundError,
  referredContainerNotFoundError,
  referredStorageNotFoundError,
  reviewNotFoundError,
} from '../../../../src/logic/errors.js'
import type {
  CreateIf,
  NewReview,
  Review,
  FullReviewListOrder,
  FullReviewListRequest,
  ReviewListRequest,
  UpdateIf,
} from '../../../../src/logic/review/review.js'
import type { LockId } from '../../../../src/logic/db.js'
import type { Pagination } from '../../../../src/logic/pagination.js'
import * as reviewService from '../../../../src/logic/internal/review/service.js'

import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'
import {
  buildCreateReviewRequest,
  buildJoinedReview,
  buildReview,
  buildReviewListFilter,
  buildUpdateReviewRequest,
} from '../../review/builders.js'

const reviewListFilter = buildReviewListFilter()

const createReviewRequest = buildCreateReviewRequest()

const updateReviewRequest = buildUpdateReviewRequest()

// The review as the repository returns it after an insert or an update.
const review = buildReview()

const joinedReview = buildJoinedReview()

const order: FullReviewListOrder = {
  property: 'rating',
  direction: 'desc',
}

const pagination: Pagination = {
  size: 10,
  skip: 80,
}

const storageId = '1e90c440-73d4-4de4-bc31-c267df3e8d46'

function lockOnly(lockedId: string): LockId {
  return async (id: string): Promise<string | undefined> => {
    assertEqual(id, lockedId)
    return id
  }
}

const createIfLocks = {
  lockBeer: lockOnly(createReviewRequest.beer),
  lockContainer: lockOnly(createReviewRequest.container),
}

const updateIfLocks = {
  lockBeer: lockOnly(updateReviewRequest.beer),
  lockContainer: lockOnly(updateReviewRequest.container),
}

const createReview = async (newReview: NewReview) => {
  assertDeepEqual(newReview, {
    ...createReviewRequest,
    time: new Date(createReviewRequest.time),
  })
  return review
}

const reviewId = '8cb936ee-77d7-46ed-89e1-4ca25bbd0416'

const updateReview = async (updatedReview: Review) => {
  assertDeepEqual(updatedReview, {
    ...updateReviewRequest,
    id: reviewId,
    time: new Date(updateReviewRequest.time),
  })
  return review
}

async function notCalled(): Promise<undefined> {
  throw new Error('must not be called')
}

describe('review service unit tests', () => {
  it('create review', async () => {
    const createIf: CreateIf = {
      ...createIfLocks,
      createReview,
      deleteFromStorage: notCalled,
      lockStorage: notCalled,
    }
    const result = await reviewService.createReview(
      createIf,
      createReviewRequest,
      undefined,
      log,
    )
    assertDeepEqual(result, review)
  })

  it('fail to create review with invalid beer', async () => {
    const createIf: CreateIf = {
      ...createIfLocks,
      createReview,
      deleteFromStorage: notCalled,
      lockBeer: async () => undefined,
      lockStorage: notCalled,
    }
    await expectReject(async () => {
      await reviewService.createReview(
        createIf,
        createReviewRequest,
        undefined,
        log,
      )
    }, referredBeerNotFoundError)
  })

  it('fail to create review with invalid container', async () => {
    const createIf: CreateIf = {
      ...createIfLocks,
      createReview,
      deleteFromStorage: notCalled,
      lockContainer: async () => undefined,
      lockStorage: notCalled,
    }
    await expectReject(async () => {
      await reviewService.createReview(
        createIf,
        createReviewRequest,
        undefined,
        log,
      )
    }, referredContainerNotFoundError)
  })

  it('create review from storage', async () => {
    let deletedFromStorage = false
    const create = async (newReview: NewReview) => {
      assertEqual(deletedFromStorage, false)
      return createReview(newReview)
    }
    const deleteFromStorage = async (deleteId: string) => {
      assertEqual(deletedFromStorage, false)
      deletedFromStorage = true
      assertEqual(deleteId, storageId)
    }
    const createIf: CreateIf = {
      ...createIfLocks,
      createReview: create,
      deleteFromStorage,
      lockStorage: lockOnly(storageId),
    }
    const result = await reviewService.createReview(
      createIf,
      createReviewRequest,
      storageId,
      log,
    )
    assertDeepEqual(result, review)
    assertEqual(deletedFromStorage, true)
  })

  it('fail to create review with invalid storage', async () => {
    const createIf: CreateIf = {
      ...createIfLocks,
      createReview,
      deleteFromStorage: notCalled,
      lockStorage: async () => undefined,
    }
    await expectReject(async () => {
      await reviewService.createReview(
        createIf,
        createReviewRequest,
        storageId,
        log,
      )
    }, referredStorageNotFoundError)
  })

  it('update review', async () => {
    const updateIf: UpdateIf = {
      ...updateIfLocks,
      updateReview,
    }
    const result = await reviewService.updateReview(
      updateIf,
      reviewId,
      updateReviewRequest,
      log,
    )
    assertDeepEqual(result, review)
  })

  it('fail to update review with invalid beer', async () => {
    const updateIf: UpdateIf = {
      ...updateIfLocks,
      updateReview,
      lockBeer: async () => undefined,
    }
    await expectReject(async () => {
      await reviewService.updateReview(
        updateIf,
        reviewId,
        updateReviewRequest,
        log,
      )
    }, referredBeerNotFoundError)
  })

  it('fail to update review with invalid container', async () => {
    const updateIf: UpdateIf = {
      ...updateIfLocks,
      updateReview,
      lockContainer: async () => undefined,
    }
    await expectReject(async () => {
      await reviewService.updateReview(
        updateIf,
        reviewId,
        updateReviewRequest,
        log,
      )
    }, referredContainerNotFoundError)
  })

  it('find review', async () => {
    const found = buildReview()
    const finder = async (findId: string) => {
      assertEqual(findId, found.id)
      return found
    }
    const result = await reviewService.findReviewById(finder, found.id, log)
    assertDeepEqual(result, found)
  })

  it('not find review with unknown id', async () => {
    const id = '544369e2-f10b-4799-9b67-527731a78011'
    const finder = async (searchId: string) => {
      assertEqual(searchId, id)
      return undefined
    }
    await expectReject(async () => {
      await reviewService.findReviewById(finder, id, log)
    }, reviewNotFoundError(id))
  })

  it('list reviews', async () => {
    const lister = async (
      listPagination: Pagination,
      listRequest: FullReviewListRequest,
    ) => {
      assertDeepEqual(listPagination, pagination)
      assertDeepEqual(listRequest.filter, reviewListFilter)
      assertDeepEqual(listRequest.order, order)
      return [joinedReview]
    }
    const result = await reviewService.listReviews(
      lister,
      pagination,
      {
        filter: reviewListFilter,
        order: order,
      },
      log,
    )
    assertDeepEqual(result, [joinedReview])
  })

  it('list reviews by beer', async () => {
    const beerId = 'ff16b2f6-7862-4e55-9ecb-b67d617e8f9c'
    const lister = async (
      listBeerId: string,
      listRequest: ReviewListRequest,
    ) => {
      assertEqual(listBeerId, beerId)
      assertDeepEqual(listRequest.filter, reviewListFilter)
      assertDeepEqual(listRequest.order, order)
      return [joinedReview]
    }
    const result = await reviewService.listReviewsByBeer(
      lister,
      beerId,
      {
        filter: reviewListFilter,
        order: order,
      },
      log,
    )
    assertDeepEqual(result, [joinedReview])
  })

  it('list reviews by brewery', async () => {
    const breweryId = 'f7471dfd-9af9-4a9b-b39d-47f4e7199800'
    const lister = async (
      listBreweryId: string,
      listRequest: ReviewListRequest,
    ) => {
      assertEqual(listBreweryId, breweryId)
      assertDeepEqual(listRequest.filter, reviewListFilter)
      assertDeepEqual(listRequest.order, order)
      return [joinedReview]
    }
    const result = await reviewService.listReviewsByBrewery(
      lister,
      breweryId,
      {
        filter: reviewListFilter,
        order: order,
      },
      log,
    )
    assertDeepEqual(result, [joinedReview])
  })

  it('list reviews by location', async () => {
    const locationId = '714b123e-c6c1-4e1a-b6f8-0ce4e076520e'
    const lister = async (
      listLocationId: string,
      listRequest: ReviewListRequest,
    ) => {
      assertEqual(listLocationId, locationId)
      assertDeepEqual(listRequest.filter, reviewListFilter)
      assertDeepEqual(listRequest.order, order)
      return [joinedReview]
    }
    const result = await reviewService.listReviewsByLocation(
      lister,
      locationId,
      {
        filter: reviewListFilter,
        order: order,
      },
      log,
    )
    assertDeepEqual(result, [joinedReview])
  })

  it('list reviews by style', async () => {
    const styleId = 'b265c454-6842-415b-840c-bfdb579aa658'
    const lister = async (
      listStyleId: string,
      listRequest: ReviewListRequest,
    ) => {
      assertEqual(listStyleId, styleId)
      assertDeepEqual(listRequest.filter, reviewListFilter)
      assertDeepEqual(listRequest.order, order)
      return [joinedReview]
    }
    const result = await reviewService.listReviewsByStyle(
      lister,
      styleId,
      {
        filter: reviewListFilter,
        order: order,
      },
      log,
    )
    assertDeepEqual(result, [joinedReview])
  })
})
