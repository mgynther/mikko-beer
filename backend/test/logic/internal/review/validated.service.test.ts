import { describe, it } from 'node:test'

import * as reviewService from '../../../../src/logic/internal/review/validated.service.js'

import type {
  Review,
  CreateReviewRequest,
  CreateIf,
  JoinedReview,
  ReviewListRequest,
  UpdateReviewRequest,
  UpdateIf,
  ValidateCreateReview,
  ValidateReviewId,
  ValidateUpdateReview,
} from '../../../../src/logic/review/review.js'
import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import {
  invalidBeerIdError,
  invalidBreweryIdError,
  invalidLocationIdError,
  invalidReviewError,
  invalidReviewIdError,
  invalidStyleIdError,
} from '../../../../src/logic/errors.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'

const storageId = '970c40b2-94ad-4825-b683-c3f5e9046063'

const validCreateReviewRequest: CreateReviewRequest = {
  additionalInfo: '',
  beer: '578d78a7-11b8-471d-bf60-d25dfcc57ebd',
  container: 'b474a006-29b8-471a-bd3a-98e0a4e26908',
  location: '',
  rating: 9,
  smell: 'quite nice',
  taste: 'fruity, pleasant citrus',
  time: '2024-06-02T12:00:00.000Z',
}

const validUpdateReviewRequest: UpdateReviewRequest = {
  additionalInfo: '',
  beer: '7c148cf3-ef09-42df-9268-362afca56a32',
  container: '0866246b-cf0d-43b9-b38d-92cca166cddb',
  location: '',
  rating: 9,
  smell: 'quite nice',
  taste: 'fruity, pleasant citrus',
  time: '2024-06-02T12:00:00.000Z',
}

const review: Review = {
  ...validCreateReviewRequest,
  id: '9acc327d-3cbc-4bcc-b3ce-59aeff45ad33',
  time: new Date(validCreateReviewRequest.time),
}

const invalidReviewRequest = {
  smell: 'quite nice',
  taste: 'fruity, pleasant citrus',
}

const createIf: CreateIf = {
  createReview: async () => review,
  deleteFromStorage: async () => undefined,
  lockBeer: async () => validCreateReviewRequest.beer,
  lockContainer: async () => validCreateReviewRequest.container,
  lockStorage: async () => '754dcf3d-a93c-4ba3-af25-fb3f0a5d2153',
}

const updateIf: UpdateIf = {
  updateReview: async () => review,
  lockBeer: async () => validCreateReviewRequest.beer,
  lockContainer: async () => validCreateReviewRequest.container,
}

const passCreateValidation: ValidateCreateReview = (input: unknown) => {
  assertDeepEqual(input, validCreateReviewRequest)
  return {
    errorCode: undefined,
    result: validCreateReviewRequest,
  }
}

const failCreateValidation: ValidateCreateReview = () => {
  return {
    errorCode: 'invalid-review',
    result: undefined,
  }
}

const passUpdateValidation: ValidateUpdateReview = (
  input: unknown,
  id: string | undefined,
) => {
  assertDeepEqual(input, validUpdateReviewRequest)
  assertEqual(id, review.id)
  return {
    errorCode: undefined,
    result: {
      id: review.id,
      request: validUpdateReviewRequest,
    },
  }
}

const failUpdateValidationWithReview: ValidateUpdateReview = () => {
  return {
    errorCode: 'invalid-review',
    result: undefined,
  }
}

const failUpdateValidationWithId: ValidateUpdateReview = () => {
  return {
    errorCode: 'invalid-review-id',
    result: undefined,
  }
}

const passReviewIdValidation: ValidateReviewId = (id: string | undefined) => ({
  errorCode: undefined,
  result: id ?? '',
})

const failReviewIdValidation: ValidateReviewId = () => ({
  errorCode: 'invalid-review-id',
  result: undefined,
})

describe('review validated service unit tests', () => {
  it('create review', async () => {
    await reviewService.createReview(
      createIf,
      passCreateValidation,
      validCreateReviewRequest,
      storageId,
      log,
    )
  })

  it('fail to create invalid review', async () => {
    await expectReject(async () => {
      await reviewService.createReview(
        createIf,
        failCreateValidation,
        invalidReviewRequest,
        storageId,
        log,
      )
    }, invalidReviewError)
  })

  it('update review', async () => {
    await reviewService.updateReview(
      updateIf,
      passUpdateValidation,
      review.id,
      validUpdateReviewRequest,
      log,
    )
  })

  it('fail to update review with invalid review', async () => {
    await expectReject(async () => {
      await reviewService.updateReview(
        updateIf,
        failUpdateValidationWithReview,
        review.id,
        invalidReviewRequest,
        log,
      )
    }, invalidReviewError)
  })

  it('fail to update review with undefined id', async () => {
    await expectReject(async () => {
      await reviewService.updateReview(
        updateIf,
        failUpdateValidationWithId,
        undefined,
        validUpdateReviewRequest,
        log,
      )
    }, invalidReviewIdError)
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  it('find review by id', async () => {
    const result = await reviewService.findReviewById(
      async () => review,
      passReviewIdValidation,
      review.id,
      log,
    )
    assertDeepEqual(result, review)
  })

  it('fail to find review by invalid id', async () => {
    await expectReject(async () => {
      await reviewService.findReviewById(
        notCalled,
        failReviewIdValidation,
        undefined,
        log,
      )
    }, invalidReviewIdError)
  })

  const reviewListRequest: ReviewListRequest = {
    filter: {
      minRating: 4,
      maxRating: 10,
      minTime: new Date('1970-01-01'),
      maxTime: new Date('9999-01-01'),
    },
    order: { property: 'time', direction: 'desc' },
  }

  it('list reviews by beer', async () => {
    const beerId = '2e8f2c9f-5f31-4e84-9d22-f0b13d6ad9b0'
    const joinedReviews: JoinedReview[] = []
    const result = await reviewService.listReviewsByBeer(
      async () => joinedReviews,
      () => ({ errorCode: undefined, result: beerId }),
      beerId,
      reviewListRequest,
      log,
    )
    assertDeepEqual(result, joinedReviews)
  })

  it('fail to list reviews by invalid beer id', async () => {
    await expectReject(async () => {
      await reviewService.listReviewsByBeer(
        notCalled,
        () => ({ errorCode: 'invalid-beer-id', result: undefined }),
        undefined,
        reviewListRequest,
        log,
      )
    }, invalidBeerIdError)
  })

  it('list reviews by brewery', async () => {
    const breweryId = 'd7e4b5da-6d44-4a1f-a2f1-3c2b1a70b3b1'
    const joinedReviews: JoinedReview[] = []
    const result = await reviewService.listReviewsByBrewery(
      async () => joinedReviews,
      () => ({ errorCode: undefined, result: breweryId }),
      breweryId,
      reviewListRequest,
      log,
    )
    assertDeepEqual(result, joinedReviews)
  })

  it('fail to list reviews by invalid brewery id', async () => {
    await expectReject(async () => {
      await reviewService.listReviewsByBrewery(
        notCalled,
        () => ({ errorCode: 'invalid-brewery-id', result: undefined }),
        undefined,
        reviewListRequest,
        log,
      )
    }, invalidBreweryIdError)
  })

  it('list reviews by location', async () => {
    const locationId = '4dcd6b2a-15e3-4bcb-9d4c-3cb5cc1a5ad3'
    const joinedReviews: JoinedReview[] = []
    const result = await reviewService.listReviewsByLocation(
      async () => joinedReviews,
      () => ({ errorCode: undefined, result: locationId }),
      locationId,
      reviewListRequest,
      log,
    )
    assertDeepEqual(result, joinedReviews)
  })

  it('fail to list reviews by invalid location id', async () => {
    await expectReject(async () => {
      await reviewService.listReviewsByLocation(
        notCalled,
        () => ({ errorCode: 'invalid-location-id', result: undefined }),
        undefined,
        reviewListRequest,
        log,
      )
    }, invalidLocationIdError)
  })

  it('list reviews by style', async () => {
    const styleId = 'd33f2cd5-2d35-4d6a-8e77-07cbe1d0a6ab'
    const joinedReviews: JoinedReview[] = []
    const result = await reviewService.listReviewsByStyle(
      async () => joinedReviews,
      () => ({ errorCode: undefined, result: styleId }),
      styleId,
      reviewListRequest,
      log,
    )
    assertDeepEqual(result, joinedReviews)
  })

  it('fail to list reviews by invalid style id', async () => {
    await expectReject(async () => {
      await reviewService.listReviewsByStyle(
        notCalled,
        () => ({ errorCode: 'invalid-style-id', result: undefined }),
        undefined,
        reviewListRequest,
        log,
      )
    }, invalidStyleIdError)
  })
})
