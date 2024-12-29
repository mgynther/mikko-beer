import { expect } from 'earl'
import * as reviewService from '../../../src/core/review/authorized.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type {
  Review,
  CreateReviewRequest,
  CreateIf,
  JoinedReview,
  ReviewListOrder,
  UpdateReviewRequest,
  UpdateIf
} from '../../../src/core/review/review'
import { Role } from '../../../src/core/user/user'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  invalidReviewError,
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

describe('review authorized service unit tests', () => {
  it('create review as admin', async () => {
    await reviewService.createReview(createIf, {
      authTokenPayload: adminAuthToken,
      body: validCreateReviewRequest
    }, storageId, log)
  })

  it('fail to create review as viewer', async () => {
    await expectReject(async () => {
      await reviewService.createReview(createIf, {
        authTokenPayload: viewerAuthToken,
        body: validCreateReviewRequest
      }, storageId, log)
    }, noRightsError)
  })

  it('fail to create invalid review as admin', async () => {
    await expectReject(async () => {
      await reviewService.createReview(createIf, {
        authTokenPayload: adminAuthToken,
        body: invalidReviewRequest
      }, storageId, log)
    }, invalidReviewError)
  })

  it('update review as admin', async () => {
    await reviewService.updateReview(updateIf, {
      authTokenPayload: adminAuthToken,
      id: review.id
    }, validUpdateReviewRequest, log)
  })

  it('fail to update review as viewer', async () => {
    await expectReject(async () => {
      await reviewService.updateReview(updateIf, {
        authTokenPayload: viewerAuthToken,
        id: review.id
      }, validUpdateReviewRequest, log)
    }, noRightsError)
  })

  it('fail to update invalid review as admin', async () => {
    await expectReject(async () => {
      await reviewService.updateReview(updateIf, {
        authTokenPayload: adminAuthToken,
        id: review.id
      }, invalidReviewRequest, log)
    }, invalidReviewError)
  })
  ;

  [adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    const reviewListOrder: ReviewListOrder = {
      property: 'beer_name',
      direction: 'asc'
    }
    const joinedReview: JoinedReview = {
      ...review,
      beerId: review.beer,
      beerName: 'Weizenbock',
      breweries: [{
        id: '10a7f306-5cf8-480e-aa52-9d85a421c7c0',
        name: 'Koskipanimo'
      }],
      container: {
        id: '30f66fe6-4f2c-4b76-a03e-e9ebead65a14',
        size: '0.50',
        type: 'draft'
      },
      styles: [{
        id: 'c9ea7133-9392-4c28-b8f5-33c61350809c',
        name: 'Weizenbock'
      }]
    }
    it(`find review as ${token.role}`, async () => {
      const result = await reviewService.findReviewById(
        async () => review,
        {
          authTokenPayload: token,
          id: review.id
        },
        log
      )
      expect(result).toEqual(review)
    })

    it(`list reviews as ${token.role}`, async () => {
      const result = await reviewService.listReviews(
        async () => [joinedReview],
        token,
        { skip: 0, size: 20 },
        reviewListOrder,
        log
      )
      expect(result).toEqual([joinedReview])
    })

    it(`list reviews by beer as ${token.role}`, async () => {
      const result = await reviewService.listReviewsByBeer(
        async () => [joinedReview],
        {
          authTokenPayload: token,
          id: joinedReview.beerId
        },
        reviewListOrder,
        log
      )
      expect(result).toEqual([joinedReview])
    })

    it(`list reviews by brewery as ${token.role}`, async () => {
      const result = await reviewService.listReviewsByBrewery(
        async () => [joinedReview],
        {
          authTokenPayload: token,
          id: joinedReview.breweries[0].id
        },
        reviewListOrder,
        log
      )
      expect(result).toEqual([joinedReview])
    })

    it(`list reviews by style as ${token.role}`, async () => {
      const result = await reviewService.listReviewsByStyle(
        async () => [joinedReview],
        {
          authTokenPayload: token,
          id: joinedReview.styles[0].id
        },
        reviewListOrder,
        log
      )
      expect(result).toEqual([joinedReview])
    })
  })

})
