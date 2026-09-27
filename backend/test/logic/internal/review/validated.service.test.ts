import { suite, test } from '../../../test.js'

import * as reviewService from '../../../../src/logic/internal/review/validated.service.js'

import type {
  CreateIf,
  FullReviewListRequest,
  JoinedReview,
  ReviewListRequest,
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
  invalidPaginationError,
  invalidReviewError,
  invalidReviewIdError,
  invalidStyleIdError,
} from '../../../../src/logic/errors.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'
import {
  buildCreateReviewRequest,
  buildReview,
  buildReviewListFilter,
  buildUpdateReviewRequest,
} from '../../review/builders.js'
import {
  defaultReviewListQuery,
  passFilteredReviewListValidation,
  passFullReviewListValidation,
} from '../../review/list-validation.js'
import { failPaginationValidation } from '../../pagination-validation.js'
import { mockFunction } from '../../../mock.js'

const storageId = '970c40b2-94ad-4825-b683-c3f5e9046063'

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

suite('review validated service unit tests', () => {
  test('create review', async () => {
    await reviewService.createReview(
      createIf,
      passCreateValidation,
      validCreateReviewRequest,
      storageId,
      log,
    )
  })

  test('fail to create invalid review', async () => {
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

  test('create review from storage', async () => {
    const deleteFromStorage = mockFunction<[storageId: string], Promise<void>>(
      async () => undefined,
    )
    await reviewService.createReview(
      { ...createIf, deleteFromStorage },
      passCreateValidation,
      validCreateReviewRequest,
      storageId,
      log,
    )
    assertDeepEqual(
      deleteFromStorage.mock.calls.map((call) => call.arguments),
      [[storageId]],
    )
  })

  test('create review without storage for an empty storage', async () => {
    const deleteFromStorage = mockFunction<[storageId: string], Promise<void>>(
      async () => undefined,
    )
    await reviewService.createReview(
      { ...createIf, deleteFromStorage },
      passCreateValidation,
      validCreateReviewRequest,
      '',
      log,
    )
    assertEqual(deleteFromStorage.mock.callCount(), 0)
  })

  test('update review', async () => {
    await reviewService.updateReview(
      updateIf,
      passUpdateValidation,
      review.id,
      validUpdateReviewRequest,
      log,
    )
  })

  test('fail to update review with invalid review', async () => {
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

  test('fail to update review with undefined id', async () => {
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

  test('find review by id', async () => {
    const result = await reviewService.findReviewById(
      async () => review,
      passReviewIdValidation,
      review.id,
      log,
    )
    assertDeepEqual(result, review)
  })

  test('fail to find review by invalid id', async () => {
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
    filter: buildReviewListFilter(),
    order: { property: 'time', direction: 'desc' },
  }

  test('list reviews by beer', async () => {
    const beerId = '2e8f2c9f-5f31-4e84-9d22-f0b13d6ad9b0'
    const joinedReviews: JoinedReview[] = []
    const result = await reviewService.listReviewsByBeer(
      async () => joinedReviews,
      () => ({ errorCode: undefined, result: beerId }),
      passFilteredReviewListValidation(reviewListRequest),
      beerId,
      defaultReviewListQuery,
      log,
    )
    assertDeepEqual(result, {
      reviews: joinedReviews,
      order: reviewListRequest.order,
    })
  })

  test('fail to list reviews by invalid beer id', async () => {
    await expectReject(async () => {
      await reviewService.listReviewsByBeer(
        notCalled,
        () => ({ errorCode: 'invalid-beer-id', result: undefined }),
        passFilteredReviewListValidation(reviewListRequest),
        undefined,
        defaultReviewListQuery,
        log,
      )
    }, invalidBeerIdError)
  })

  test('list reviews by brewery', async () => {
    const breweryId = 'd7e4b5da-6d44-4a1f-a2f1-3c2b1a70b3b1'
    const joinedReviews: JoinedReview[] = []
    const result = await reviewService.listReviewsByBrewery(
      async () => joinedReviews,
      () => ({ errorCode: undefined, result: breweryId }),
      passFilteredReviewListValidation(reviewListRequest),
      breweryId,
      defaultReviewListQuery,
      log,
    )
    assertDeepEqual(result, {
      reviews: joinedReviews,
      order: reviewListRequest.order,
    })
  })

  test('fail to list reviews by invalid brewery id', async () => {
    await expectReject(async () => {
      await reviewService.listReviewsByBrewery(
        notCalled,
        () => ({ errorCode: 'invalid-brewery-id', result: undefined }),
        passFilteredReviewListValidation(reviewListRequest),
        undefined,
        defaultReviewListQuery,
        log,
      )
    }, invalidBreweryIdError)
  })

  test('list reviews by location', async () => {
    const locationId = '4dcd6b2a-15e3-4bcb-9d4c-3cb5cc1a5ad3'
    const joinedReviews: JoinedReview[] = []
    const result = await reviewService.listReviewsByLocation(
      async () => joinedReviews,
      () => ({ errorCode: undefined, result: locationId }),
      passFilteredReviewListValidation(reviewListRequest),
      locationId,
      defaultReviewListQuery,
      log,
    )
    assertDeepEqual(result, {
      reviews: joinedReviews,
      order: reviewListRequest.order,
    })
  })

  test('fail to list reviews by invalid location id', async () => {
    await expectReject(async () => {
      await reviewService.listReviewsByLocation(
        notCalled,
        () => ({ errorCode: 'invalid-location-id', result: undefined }),
        passFilteredReviewListValidation(reviewListRequest),
        undefined,
        defaultReviewListQuery,
        log,
      )
    }, invalidLocationIdError)
  })

  test('list reviews by style', async () => {
    const styleId = 'd33f2cd5-2d35-4d6a-8e77-07cbe1d0a6ab'
    const joinedReviews: JoinedReview[] = []
    const result = await reviewService.listReviewsByStyle(
      async () => joinedReviews,
      () => ({ errorCode: undefined, result: styleId }),
      passFilteredReviewListValidation(reviewListRequest),
      styleId,
      defaultReviewListQuery,
      log,
    )
    assertDeepEqual(result, {
      reviews: joinedReviews,
      order: reviewListRequest.order,
    })
  })

  test('fail to list reviews by invalid style id', async () => {
    await expectReject(async () => {
      await reviewService.listReviewsByStyle(
        notCalled,
        () => ({ errorCode: 'invalid-style-id', result: undefined }),
        passFilteredReviewListValidation(reviewListRequest),
        undefined,
        defaultReviewListQuery,
        log,
      )
    }, invalidStyleIdError)
  })

  const fullReviewListRequest: FullReviewListRequest = {
    filter: buildReviewListFilter(),
    order: { property: 'rating', direction: 'desc' },
  }

  test('list reviews', async () => {
    const joinedReviews: JoinedReview[] = []
    const result = await reviewService.listReviews(
      async () => joinedReviews,
      passFullReviewListValidation(fullReviewListRequest, {
        size: 20,
        skip: 0,
      }),
      { size: '20', skip: '0' },
      defaultReviewListQuery,
      log,
    )
    assertDeepEqual(result, {
      reviews: joinedReviews,
      pagination: { size: 20, skip: 0 },
      order: fullReviewListRequest.order,
    })
  })

  test('fail to list reviews with invalid pagination', async () => {
    await expectReject(async () => {
      await reviewService.listReviews(
        notCalled,
        {
          ...passFullReviewListValidation(fullReviewListRequest, {
            size: 20,
            skip: 0,
          }),
          pagination: failPaginationValidation,
        },
        { size: 'invalid', skip: '0' },
        defaultReviewListQuery,
        log,
      )
    }, invalidPaginationError)
  })
})
