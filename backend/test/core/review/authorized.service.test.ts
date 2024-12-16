import * as reviewService from '../../../src/core/review/authorized.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type {
  Review,
  CreateReviewRequest,
  CreateIf,
  UpdateReviewRequest,
  UpdateIf
} from '../../../src/core/review/review'
import { Role } from '../../../src/core/user/user'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  ControllerError,
  invalidReviewError,
  invalidReviewIdError,
  noRightsError
} from '../../../src/core/errors'

const storageId = '5e11fcf9-3fa4-402d-90e2-17706e8d78e6'

const validCreateReviewRequest: CreateReviewRequest = {
  additionalInfo: '',
  beer: '62d30965-f42d-451d-b79f-0dc41d4d3088',
  container: 'f0d1aa85-12a3-45e5-8bf4-44c7e9d38c12',
  location: '',
  rating: 9,
  smell: 'quite nice',
  taste: 'fruity, pleasant citrus',
  time: '2024-06-02T12:00:00.000Z'
}

const validUpdateReviewRequest: UpdateReviewRequest = {
  additionalInfo: '',
  beer: '1611037d-0938-423e-a10c-bacd95052cec',
  container: '449dba95-c10d-4810-8ecf-92f9c33a18a4',
  location: '',
  rating: 9,
  smell: 'quite nice',
  taste: 'fruity, pleasant citrus',
  time: '2024-06-02T12:00:00.000Z'
}

const review: Review = {
  ...validCreateReviewRequest,
  id: '1d8f6ba2-8813-4a6f-b520-ecd56cb3c646',
  time: new Date(validCreateReviewRequest.time)
}

const invalidReviewRequest = {
  smell: 'quite nice',
  taste: 'fruity, pleasant citrus'
}

const createIf: CreateIf = {
  createReview: async () => review,
  deleteFromStorage: async () => undefined,
  lockBeer: async () => validCreateReviewRequest.beer,
  lockContainer: async () => validCreateReviewRequest.container,
  lockStorage: async () => 'a48879ea-8249-4c08-8118-cea63beca4cf'
}

const updateIf: UpdateIf = {
  updateReview: async () => review,
  lockBeer: async () => validCreateReviewRequest.beer,
  lockContainer: async () => validCreateReviewRequest.container
}

const adminAuthToken: AuthTokenPayload = {
  userId: '97bfead4-409a-4989-a2b8-cb2f1cd126a0',
  role: Role.admin,
  refreshTokenId: '22404eb4-a865-485a-8be6-01f519d69169'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: 'a2ed9601-f68d-45a7-ab33-bfc34ee43c24',
  role: Role.viewer,
  refreshTokenId: '35cab924-9f13-4a9c-a204-77d77dca0c5f'
}

interface CreateRejectionTest {
  token: AuthTokenPayload
  body: unknown
  error: ControllerError
  title: string
}

const createRejectionTests: CreateRejectionTest[] = [
  {
    token: viewerAuthToken,
    body: validCreateReviewRequest,
    error: noRightsError,
    title: 'fail to create review as viewer'
  },
  {
    token: viewerAuthToken,
    body: invalidReviewRequest,
    error: noRightsError,
    title: 'fail to create invalid review as viewer'
  },
  {
    token: adminAuthToken,
    body: invalidReviewRequest,
    error: invalidReviewError,
    title: 'fail to create invalid review as admin'
  }
]

interface UpdateRejectionTest {
  token: AuthTokenPayload
  body: unknown
  reviewId: string | undefined
  error: ControllerError
  title: string
}

const updateRejectionTests: UpdateRejectionTest[] = [
  {
    token: viewerAuthToken,
    body: validUpdateReviewRequest,
    reviewId: review.id,
    error: noRightsError,
    title: 'fail to update review as viewer'
  },
  {
    token: viewerAuthToken,
    body: invalidReviewRequest,
    reviewId: review.id,
    error: noRightsError,
    title: 'fail to update invalid review as viewer'
  },
  {
    token: viewerAuthToken,
    body: validUpdateReviewRequest,
    reviewId: undefined,
    error: noRightsError,
    title: 'fail to update review with undefined id as viewer'
  },
  {
    token: adminAuthToken,
    body: invalidReviewRequest,
    reviewId: review.id,
    error: invalidReviewError,
    title: 'fail to update invalid review as admin'
  },
  {
    token: adminAuthToken,
    body: validUpdateReviewRequest,
    reviewId: undefined,
    error: invalidReviewIdError,
    title: 'fail to update review with undefined id as admin'
  },
]

describe('review authorized service unit tests', () => {
  it('create review as admin', async () => {
    await reviewService.createReview(createIf, {
      authTokenPayload: adminAuthToken,
      body: validCreateReviewRequest
    }, storageId, log)
  })

  createRejectionTests.forEach(testCase => {
    it(testCase.title, async () => {
      await expectReject(async () => {
        await reviewService.createReview(createIf, {
          authTokenPayload: testCase.token,
          body: testCase.body
        }, storageId, log)
      }, testCase.error)
    })
  })

  it('update review as admin', async () => {
    await reviewService.updateReview(updateIf, {
      authTokenPayload: adminAuthToken,
      id: review.id
    }, validUpdateReviewRequest, log)
  })

  updateRejectionTests.forEach(testCase => {
    it(testCase.title, async () => {
      await expectReject(async () => {
        await reviewService.updateReview(updateIf, {
          authTokenPayload: testCase.token,
          id: testCase.reviewId
        }, testCase.body, log)
      }, testCase.error)
    })
  })
})
