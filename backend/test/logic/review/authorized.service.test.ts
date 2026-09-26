import { describe, it } from 'node:test'

import * as reviewService from '../../../src/logic/review/authorized.service.js'

import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token.js'
import type {
  CreateIf,
  ReviewListOrder,
  UpdateIf,
  FullReviewListRequest,
  ReviewListRequest,
} from '../../../src/logic/review/review.js'
import { dummyLog as log } from '../dummy-log.js'
import { expectReject } from '../controller-error-helper.js'
import { invalidReviewError, noRightsError } from '../../../src/logic/errors.js'
import { assertDeepEqual } from '../../assert.js'
import { buildAuthTokenPayload } from '../auth/builders.js'
import {
  buildCreateReviewRequest,
  buildJoinedReview,
  buildReview,
  buildReviewListFilter,
  buildUpdateReviewRequest,
} from './builders.js'

const storageId = '5e11fcf9-3fa4-402d-90e2-17706e8d78e6'

const reviewListFilter = buildReviewListFilter()

const validCreateReviewRequest = buildCreateReviewRequest()

const validUpdateReviewRequest = buildUpdateReviewRequest()

const review = buildReview()

const invalidReviewRequest = {
  smell: 'quite nice',
  taste: 'fruity, pleasant citrus',
}

// Every beer, container and storage a request refers to exists.
const createIf: CreateIf = {
  createReview: async () => review,
  deleteFromStorage: async () => undefined,
  lockBeer: async (id: string) => id,
  lockContainer: async (id: string) => id,
  lockStorage: async (id: string) => id,
}

const updateIf: UpdateIf = {
  updateReview: async () => review,
  lockBeer: async (id: string) => id,
  lockContainer: async (id: string) => id,
}

const adminAuthToken = buildAuthTokenPayload({ role: 'admin' })

const viewerAuthToken = buildAuthTokenPayload({ role: 'viewer' })

describe('review authorized service unit tests', () => {
  function notCalled(): any {
    throw new Error('not to be called')
  }

  const passReviewIdValidation = (id: string | undefined) =>
    ({ errorCode: undefined, result: id ?? '' }) as const

  it('create review as admin', async () => {
    await reviewService.createReview(
      createIf,
      () => ({ errorCode: undefined, result: validCreateReviewRequest }),
      {
        authTokenPayload: adminAuthToken,
        body: validCreateReviewRequest,
      },
      storageId,
      log,
    )
  })

  it('fail to create review as viewer', async () => {
    await expectReject(async () => {
      await reviewService.createReview(
        createIf,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          body: validCreateReviewRequest,
        },
        storageId,
        log,
      )
    }, noRightsError)
  })

  it('fail to create invalid review as admin', async () => {
    await expectReject(async () => {
      await reviewService.createReview(
        createIf,
        () => ({ errorCode: 'invalid-review', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          body: invalidReviewRequest,
        },
        storageId,
        log,
      )
    }, invalidReviewError)
  })

  it('update review as admin', async () => {
    await reviewService.updateReview(
      updateIf,
      () => ({
        errorCode: undefined,
        result: { id: review.id, request: validUpdateReviewRequest },
      }),
      {
        authTokenPayload: adminAuthToken,
        id: review.id,
      },
      validUpdateReviewRequest,
      log,
    )
  })

  it('fail to update review as viewer', async () => {
    await expectReject(async () => {
      await reviewService.updateReview(
        updateIf,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          id: review.id,
        },
        validUpdateReviewRequest,
        log,
      )
    }, noRightsError)
  })

  it('fail to update invalid review as admin', async () => {
    await expectReject(async () => {
      await reviewService.updateReview(
        updateIf,
        () => ({ errorCode: 'invalid-review', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          id: review.id,
        },
        invalidReviewRequest,
        log,
      )
    }, invalidReviewError)
  })
  ;[adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    const reviewListOrder: ReviewListOrder = {
      property: 'beer_name',
      direction: 'asc',
    }
    const reviewListRequest: ReviewListRequest = {
      filter: reviewListFilter,
      order: reviewListOrder,
    }
    const fullReviewListRequest: FullReviewListRequest = {
      filter: reviewListFilter,
      order: { property: 'time', direction: 'desc' },
    }
    const joinedReview = buildJoinedReview()
    it(`find review as ${token.role}`, async () => {
      const result = await reviewService.findReviewById(
        async () => review,
        passReviewIdValidation,
        {
          authTokenPayload: token,
          id: review.id,
        },
        log,
      )
      assertDeepEqual(result, review)
    })

    it(`list reviews as ${token.role}`, async () => {
      const result = await reviewService.listReviews(
        async () => [joinedReview],
        token,
        { skip: 0, size: 20 },
        fullReviewListRequest,
        log,
      )
      assertDeepEqual(result, [joinedReview])
    })

    it(`list reviews by beer as ${token.role}`, async () => {
      const result = await reviewService.listReviewsByBeer(
        async () => [joinedReview],
        (id: string | undefined) => ({
          errorCode: undefined,
          result: id ?? '',
        }),
        {
          authTokenPayload: token,
          id: '62d30965-f42d-451d-b79f-0dc41d4d3088',
        },
        reviewListRequest,
        log,
      )
      assertDeepEqual(result, [joinedReview])
    })

    it(`list reviews by brewery as ${token.role}`, async () => {
      const result = await reviewService.listReviewsByBrewery(
        async () => [joinedReview],
        (id: string | undefined) => ({
          errorCode: undefined,
          result: id ?? '',
        }),
        {
          authTokenPayload: token,
          id: '10a7f306-5cf8-480e-aa52-9d85a421c7c0',
        },
        reviewListRequest,
        log,
      )
      assertDeepEqual(result, [joinedReview])
    })

    it(`list reviews by location as ${token.role}`, async () => {
      const result = await reviewService.listReviewsByLocation(
        async () => [joinedReview],
        (id: string | undefined) => ({
          errorCode: undefined,
          result: id ?? '',
        }),
        {
          authTokenPayload: token,
          id: '70c3f124-d0d2-46ad-be9d-b74664894fab',
        },
        reviewListRequest,
        log,
      )
      assertDeepEqual(result, [joinedReview])
    })

    it(`list reviews by style as ${token.role}`, async () => {
      const result = await reviewService.listReviewsByStyle(
        async () => [joinedReview],
        (id: string | undefined) => ({
          errorCode: undefined,
          result: id ?? '',
        }),
        {
          authTokenPayload: token,
          id: 'c9ea7133-9392-4c28-b8f5-33c61350809c',
        },
        reviewListRequest,
        log,
      )
      assertDeepEqual(result, [joinedReview])
    })
  })
})
