import * as reviewService from '../../../../src/core/internal/review/validated.service'

import type {
  Review,
  CreateReviewRequest,
  CreateIf,
  UpdateReviewRequest,
  UpdateIf
} from '../../../../src/core/review'
import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'
import {
  invalidReviewError,
  invalidReviewIdError
} from '../../../../src/core/errors'

const storageId = '970c40b2-94ad-4825-b683-c3f5e9046063'

const validCreateReviewRequest: CreateReviewRequest = {
  additionalInfo: '',
  beer: '578d78a7-11b8-471d-bf60-d25dfcc57ebd',
  container: 'b474a006-29b8-471a-bd3a-98e0a4e26908',
  location: '',
  rating: 9,
  smell: 'quite nice',
  taste: 'fruity, pleasant citrus',
  time: '2024-06-02T12:00:00.000Z'
}

const validUpdateReviewRequest: UpdateReviewRequest = {
  additionalInfo: '',
  beer: '7c148cf3-ef09-42df-9268-362afca56a32',
  container: '0866246b-cf0d-43b9-b38d-92cca166cddb',
  location: '',
  rating: 9,
  smell: 'quite nice',
  taste: 'fruity, pleasant citrus',
  time: '2024-06-02T12:00:00.000Z'
}

const review: Review = {
  ...validCreateReviewRequest,
  id: '9acc327d-3cbc-4bcc-b3ce-59aeff45ad33',
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
  lockStorage: async () => '754dcf3d-a93c-4ba3-af25-fb3f0a5d2153'
}

const updateIf: UpdateIf = {
  updateReview: async () => review,
  lockBeer: async () => validCreateReviewRequest.beer,
  lockContainer: async () => validCreateReviewRequest.container
}

describe('review validated service unit tests', () => {
  it('create review', async () => {
    await reviewService.createReview(
      createIf,
      validCreateReviewRequest,
      storageId,
      log
    )
  })

  it('fail to create invalid review', async () => {
    await expectReject(async () => {
      await reviewService.createReview(
        createIf,
        invalidReviewRequest,
        storageId,
        log
      )
    }, invalidReviewError)
  })

  it('update review', async () => {
    await reviewService.updateReview(
      updateIf,
      review.id,
      validUpdateReviewRequest,
      log
    )
  })

  it('fail to update invalid review', async () => {
    await expectReject(async () => {
      await reviewService.updateReview(
        updateIf,
        review.id,
        invalidReviewRequest,
        log
      )
    }, invalidReviewError)
  })

  it('fail to update review with undefined id', async () => {
    await expectReject(async () => {
      await reviewService.updateReview(
        updateIf,
        undefined,
        validUpdateReviewRequest,
        log
      )
    }, invalidReviewIdError)
  })

})
